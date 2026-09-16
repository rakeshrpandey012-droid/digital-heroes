// services/exportService.js
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

class ExportService {
  /**
   * Generate PDF report with score history and winnings
   */
  static async generatePDFReport(userData) {
    try {
      const { user, scores, winnings, statistics } = userData;

      return new Promise((resolve, reject) => {
        // Create PDF document
        const fileName = `${user.firstName}_${user.lastName}_Report_${Date.now()}.pdf`;
        const filePath = path.join(process.env.TEMP_DIR || "/tmp", fileName);
        const doc = new PDFDocument();
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        // Header
        doc
          .fontSize(24)
          .font("Helvetica-Bold")
          .text("Digital Heroes", 50, 50)
          .fontSize(10)
          .font("Helvetica")
          .text("Performance & Winnings Report", 50, 80);

        // User info
        doc
          .fontSize(12)
          .font("Helvetica-Bold")
          .text("User Information", 50, 120);

        doc
          .fontSize(10)
          .font("Helvetica")
          .text(`Name: ${user.firstName} ${user.lastName}`, 50, 145)
          .text(`Email: ${user.email}`, 50, 165)
          .text(
            `Subscription: ${user.subscription.plan.toUpperCase()}`,
            50,
            185
          )
          .text(`Subscription Status: ${user.subscription.status}`, 50, 205)
          .text(
            `Report Generated: ${new Date().toLocaleDateString("en-IN")}`,
            50,
            225
          );

        // Statistics section
        doc
          .fontSize(12)
          .font("Helvetica-Bold")
          .text("Performance Statistics", 50, 270);

        const statsData = [
          ["Metric", "Value"],
          ["Average Score", `${statistics.averageScore.toFixed(1)}/45`],
          ["Highest Score", `${statistics.highestScore}/45`],
          ["Total Scores Entered", statistics.totalScoresEntered],
          ["Total Winnings", `₹${statistics.totalWinnings.toLocaleString()}`],
          ["Win Rate", `${statistics.winRate.toFixed(1)}%`],
          ["Current Streak", `${statistics.streakDays} days`],
          [
            "Charity Contributed",
            `₹${statistics.charityContribution.toLocaleString()}`,
          ],
        ];

        this.drawTable(doc, statsData, 50, 300);

        // Scores section
        if (scores && scores.length > 0) {
          doc.addPage();

          doc
            .fontSize(12)
            .font("Helvetica-Bold")
            .text("Recent Scores (Last 10)", 50, 50);

          const scoresData = [
            ["Date", "Score", "Format"],
            ...scores
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .slice(0, 10)
              .map(score => [
                new Date(score.date).toLocaleDateString("en-IN"),
                score.score.toString(),
                "Stableford",
              ]),
          ];

          this.drawTable(doc, scoresData, 50, 80);

          // Score trends
          const avgScore =
            scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
          doc
            .fontSize(10)
            .font("Helvetica")
            .text(`Average Score: ${avgScore.toFixed(1)}/45`, 50, doc.y + 20)
            .text(`Total Entries: ${scores.length}`, 50, doc.y + 20);
        }

        // Winnings section
        if (winnings && winnings.length > 0) {
          doc.addPage();

          doc
            .fontSize(12)
            .font("Helvetica-Bold")
            .text("Winnings History", 50, 50);

          const winningsData = [
            ["Draw Date", "Tier", "Amount (₹)", "Status"],
            ...winnings
              .sort((a, b) => new Date(b.drawDate) - new Date(a.drawDate))
              .map(win => [
                new Date(win.drawDate).toLocaleDateString("en-IN"),
                `${win.tier}-Match`,
                win.prizeAmount.toLocaleString(),
                win.status || "Completed",
              ]),
          ];

          this.drawTable(doc, winningsData, 50, 80);

          // Winnings summary
          const totalWinnings = winnings.reduce(
            (sum, w) => sum + w.prizeAmount,
            0
          );
          doc
            .fontSize(10)
            .font("Helvetica")
            .text(
              `Total Winnings: ₹${totalWinnings.toLocaleString()}`,
              50,
              doc.y + 20
            )
            .text(`Total Draws Won: ${winnings.length}`, 50, doc.y + 20);
        }

        // Footer
        doc.on("end", () => {
          stream.close();
          resolve(filePath);
        });

        doc.end();
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw error;
    }
  }

  /**
   * Generate CSV export of scores
   */
  static generateCSVScores(scores) {
    try {
      const headers = ["Date", "Score", "Format", "Tournament"];
      const rows = scores
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(score => [
          new Date(score.date).toISOString().split("T")[0],
          score.score,
          "Stableford",
          score.tournament || "-",
        ]);

      const csv = [
        headers.join(","),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(",")),
      ].join("\n");

      return csv;
    } catch (error) {
      console.error("Error generating CSV:", error);
      throw error;
    }
  }

  /**
   * Generate CSV export of winnings
   */
  static generateCSVWinnings(winnings) {
    try {
      const headers = [
        "Draw Date",
        "Tier",
        "Prize Amount (₹)",
        "Ticket Numbers",
        "Status",
        "Verified Date",
      ];
      const rows = winnings
        .sort((a, b) => new Date(b.drawDate) - new Date(a.drawDate))
        .map(win => [
          new Date(win.drawDate).toISOString().split("T")[0],
          `${win.tier}-Match`,
          win.prizeAmount.toLocaleString(),
          win.ticketNumbers?.join("-") || "-",
          win.status || "Pending",
          win.verifiedDate
            ? new Date(win.verifiedDate).toISOString().split("T")[0]
            : "-",
        ]);

      const csv = [
        headers.join(","),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(",")),
      ].join("\n");

      return csv;
    } catch (error) {
      console.error("Error generating CSV:", error);
      throw error;
    }
  }

  /**
   * Draw table helper for PDF
   */
  static drawTable(
    doc,
    data,
    startX,
    startY,
    cellWidth = 150,
    cellHeight = 20
  ) {
    const columns = data[0].length;
    const colWidths = Array(columns).fill(cellWidth);

    // Adjust column widths based on content
    const totalWidth = 500;
    const adjustedColWidths = colWidths.map(() => totalWidth / columns);

    let y = startY;

    // Draw header
    data[0].forEach((header, i) => {
      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .rect(
          startX + adjustedColWidths.slice(0, i).reduce((a, b) => a + b, 0),
          y,
          adjustedColWidths[i],
          cellHeight
        )
        .stroke();

      doc.text(
        header,
        startX + adjustedColWidths.slice(0, i).reduce((a, b) => a + b, 0) + 5,
        y + 5,
        {
          width: adjustedColWidths[i] - 10,
          align: "left",
        }
      );
    });

    y += cellHeight;

    // Draw rows
    data.slice(1).forEach(row => {
      row.forEach((cell, i) => {
        doc
          .font("Helvetica")
          .fontSize(8)
          .rect(
            startX + adjustedColWidths.slice(0, i).reduce((a, b) => a + b, 0),
            y,
            adjustedColWidths[i],
            cellHeight
          )
          .stroke();

        doc.text(
          String(cell),
          startX + adjustedColWidths.slice(0, i).reduce((a, b) => a + b, 0) + 5,
          y + 5,
          {
            width: adjustedColWidths[i] - 10,
            align: "left",
          }
        );
      });

      y += cellHeight;
    });

    return y;
  }

  /**
   * Generate Monthly Statement PDF
   */
  static async generateMonthlyStatement(userData) {
    try {
      const { user, monthlyStats } = userData;
      const month = monthlyStats.month;
      const year = monthlyStats.year;

      return new Promise((resolve, reject) => {
        const fileName = `Digital_Heroes_Statement_${month}_${year}.pdf`;
        const filePath = path.join(process.env.TEMP_DIR || "/tmp", fileName);
        const doc = new PDFDocument();
        const stream = fs.createWriteStream(filePath);

        doc.pipe(stream);

        // Header
        doc
          .fontSize(20)
          .font("Helvetica-Bold")
          .text("Digital Heroes", 50, 40)
          .fontSize(14)
          .text("Monthly Statement", 50, 70);

        doc.fontSize(10).font("Helvetica").text(`${month} ${year}`, 50, 95);

        // User details
        doc.fontSize(11).font("Helvetica-Bold").text("Account Holder", 50, 130);

        doc
          .fontSize(10)
          .font("Helvetica")
          .text(`${user.firstName} ${user.lastName}`, 50, 150)
          .text(`Email: ${user.email}`, 50, 170)
          .text(
            `Statement Date: ${new Date().toLocaleDateString("en-IN")}`,
            50,
            190
          );

        // Monthly summary
        doc
          .fontSize(11)
          .font("Helvetica-Bold")
          .text("Monthly Summary", 50, 230);

        const summaryData = [
          ["Description", "Amount (₹)"],
          ["Subscription Fee", monthlyStats.subscriptionFee.toLocaleString()],
          [
            "Charity Contribution",
            monthlyStats.charityContribution.toLocaleString(),
          ],
          ["Prize Winnings", monthlyStats.winnings.toLocaleString()],
          ["Net Balance", monthlyStats.netBalance.toLocaleString()],
        ];

        this.drawTable(doc, summaryData, 50, 260);

        // Transactions
        if (monthlyStats.transactions && monthlyStats.transactions.length > 0) {
          doc
            .fontSize(11)
            .font("Helvetica-Bold")
            .text("Transactions", 50, doc.y + 20);

          const transactionData = [
            ["Date", "Type", "Amount (₹)", "Description"],
            ...monthlyStats.transactions.map(t => [
              new Date(t.date).toLocaleDateString("en-IN"),
              t.type.toUpperCase(),
              t.amount.toLocaleString(),
              t.description,
            ]),
          ];

          this.drawTable(doc, transactionData, 50, doc.y + 20);
        }

        // Footer
        doc
          .fontSize(8)
          .font("Helvetica")
          .text(
            "This is an electronically generated statement. No signature required.",
            50,
            doc.y + 40
          );

        doc.on("end", () => {
          stream.close();
          resolve(filePath);
        });

        doc.end();
      });
    } catch (error) {
      console.error("Error generating monthly statement:", error);
      throw error;
    }
  }
}

module.exports = ExportService;
