// generate-pdf.js

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

// --- Configuration ---
const curriculumHtmlPath = path.resolve(__dirname, '../curriculum_pt.html');
const curriculumUrl = `file://${curriculumHtmlPath}`;
const outputPdfPath = path.resolve(__dirname, '../Curriculum_Gabriel_Carvalho_pt.pdf');
// Define desktop viewport dimensions - initial height doesn't strictly matter for final PDF height now
const desktopViewport = { width: 1920, height: 1080 };
// --- End Configuration ---


async function generateCurriculumPDF() {
  console.log('Launching Puppeteer...');
  const browser = await puppeteer.launch({ headless: "new" });
  console.log(`Opening new page...`);
  const page = await browser.newPage();

  try {
    console.log(`Setting viewport to ${desktopViewport.width}x${desktopViewport.height}`);
    await page.setViewport(desktopViewport);

    console.log(`Navigating to: ${curriculumUrl}`);
    await page.goto(curriculumUrl, { waitUntil: 'networkidle0' });
    console.log('Page loaded.');

    console.log('Hiding header, footer, and download button...');
    await page.evaluate(() => {
      const header = document.querySelector('.main-header');
      const footer = document.querySelector('.main-footer');
      const downloadBtn = document.getElementById('downloadPDF'); // Or '.download-btn'
      if (header) header.style.display = 'none';
      if (footer) footer.style.display = 'none';
      if (downloadBtn) downloadBtn.style.display = 'none';
    });
    console.log('Elements hidden.');

    // *** Calculate the full page height after rendering and hiding elements ***
    const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
    console.log(`Calculated body scrollHeight: ${bodyHeight}px`);

    console.log('Emulating screen media type...');
    await page.emulateMediaType('screen');

    console.log(`Generating PDF with width ${desktopViewport.width}px and calculated height ${bodyHeight}px...`);
    await page.pdf({
      path: outputPdfPath,
      width: `${desktopViewport.width}px`, // Define the width
      height: `${bodyHeight}px`,          // *** Use calculated height ***
      printBackground: true,
      margin: {                           // Ensure margins are zero
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px'
      }
    });

    console.log(`PDF successfully generated and saved to: ${outputPdfPath}`);

  } catch (error) {
    console.error('Error generating PDF:', error);
  } finally {
    console.log('Closing browser...');
    await browser.close();
  }
}

// Run the function
generateCurriculumPDF();