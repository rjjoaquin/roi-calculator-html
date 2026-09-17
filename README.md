# Email outreach ROI calculator

A minimal static HTML, CSS, and JavaScript frontend for estimating the annual revenue impact of email outreach that uses Cloudflare Workers for its ROI calculations. The calculation code is maintained in a separate private repository and runs on the Worker, rather than in the browser.

When the form is submitted, the frontend sends the inputs to the Cloudflare Worker API. The Worker calculates the revenue impact and returns the results for the frontend to display in the chart. No calculation formulas are included in this public folder.
