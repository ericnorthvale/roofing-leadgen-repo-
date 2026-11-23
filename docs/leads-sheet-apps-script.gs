/**
 * Northvale Roofing — append website leads to this spreadsheet.
 *
 * Paste this into the spreadsheet's Apps Script editor and deploy it as a Web
 * App. The site POSTs one lead per submission; this appends a row. Setup steps
 * are in docs/setup-leads.md.
 *
 * It creates its own header row on the first lead, so the sheet can start
 * empty and the columns can never drift out of step with what the site sends.
 *
 * Phone and ZIP columns are forced to plain text. Without that, Sheets parses
 * "+12815550123" as a number and silently drops the leading "+", and a ZIP
 * with a leading zero loses it — which is the kind of quiet corruption nobody
 * notices until they try to call someone back.
 */

var HEADERS = [
  "Received",
  "Channel",
  "First name",
  "Last name",
  "Phone",
  "Email",
  "Address",
  "City",
  "ZIP",
  "Service",
  "Notes",
  "Source",
  "Campaign",
  "Landing page",
];

/** 1-based columns that must stay text: Phone (5) and ZIP (9). */
var TEXT_COLUMNS = [5, 9];

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return json({ ok: false, error: "no body" });
    }
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
      sheet.setFrozenRows(1);
      for (var i = 0; i < TEXT_COLUMNS.length; i++) {
        sheet.getRange(1, TEXT_COLUMNS[i], sheet.getMaxRows(), 1).setNumberFormat("@");
      }
    }

    sheet.appendRow([
      data.receivedAt || new Date().toISOString(),
      data.channel || "",
      data.firstName || "",
      data.lastName || "",
      data.phone || "",
      data.email || "",
      data.address || "",
      data.city || "",
      data.zip || "",
      data.service || "",
      data.notes || "",
      data.source || "",
      data.utmSource || "",
      data.landingPath || "",
    ]);

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
