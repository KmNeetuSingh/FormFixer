const express = require('express');
const cheerio = require('cheerio');
const { JSDOM } = require('jsdom');
const axe = require('axe-core');
const babel = require('@babel/core');

const router = express.Router();

// Analyze HTML forms for required attributes and label associations
router.post('/analyze', (req, res) => {
  const { html } = req.body;
  if (!html) return res.status(400).json({ error: 'HTML is required.' });

  const $ = cheerio.load(html);
  const report = [];

  $('form').each((_, form) => {
    $(form).find('input, textarea, select').each((j, el) => {
      const name = $(el).attr('name') || $(el).attr('id') || `field-${j}`;
      const id = $(el).attr('id');
      const isRequired = $(el).attr('required') !== undefined;
      const hasLabel = id && $(`label[for="${id}"]`).length > 0;

      if (!isRequired) {
        $(el).attr('required', true);
        report.push({ type: 'error', message: `❌ Missing 'required' on "${name}"` });
      }

      if (id && !hasLabel) {
        report.push({ type: 'warning', message: `⚠️ No label associated with input id="${id}"` });
      }
    });
  });

  res.json({ report, fixedHtml: $.html() });
});

// Generate JSON Schema from HTML form inputs
router.post('/schema', (req, res) => {
  const { html } = req.body;
  if (!html) return res.status(400).json({ error: 'HTML input is required.' });

  const dom = new JSDOM(html);
  const document = dom.window.document;
  const inputs = document.querySelectorAll('input, textarea, select');

  const schema = {
    type: 'object',
    properties: {},
    required: []
  };

  inputs.forEach(el => {
    const name = el.getAttribute('name') || el.getAttribute('id');
    if (!name) return;

    const typeAttr = el.getAttribute('type') || el.tagName.toLowerCase();
    const jsonType = mapToJsonType(typeAttr);

    schema.properties[name] = { type: jsonType };
    if (el.hasAttribute('required')) {
      schema.required.push(name);
    }
  });

  res.json({ schema });
});

// Transpile JSX to JS using Babel
router.post('/jsx-analyze', (req, res) => {
  const { jsx } = req.body;
  if (!jsx) return res.status(400).json({ error: 'JSX input is required.' });

  try {
    const { code } = babel.transformSync(jsx, {
      presets: ['@babel/preset-react', '@babel/preset-env'],
    });
    res.json({ compiledJs: code });
  } catch (error) {
    res.status(500).json({ error: 'Invalid JSX provided.', details: error.message });
  }
});

// Perform accessibility analysis using axe-core in jsdom
router.post('/accessibility', async (req, res) => {
  const { html } = req.body;
  if (!html) return res.status(400).json({ error: 'HTML is required.' });

  try {
    const dom = new JSDOM(html, {
      runScripts: 'dangerously',
      resources: 'usable'
    });

    const { window } = dom;

    // Wait for DOM content to be ready
    await new Promise((resolve) => {
      window.addEventListener('load', resolve);
    });

    // Inject axe-core source
    window.eval(axe.source);

    // Run axe on the window's document
    const results = await window.axe.run(window.document);
    res.json({ violations: results.violations });
  } catch (error) {
    res.status(500).json({
      error: 'Accessibility analysis failed.',
      details: error.message
    });
  }
});

// Utility: map input types to JSON schema types
function mapToJsonType(type) {
  switch (type) {
    case 'number':
    case 'range':
      return 'number';
    case 'checkbox':
    case 'radio':
      return 'boolean';
    case 'email':
    case 'password':
    case 'text':
    case 'textarea':
    case 'select':
    default:
      return 'string';
  }
}

module.exports = router;
