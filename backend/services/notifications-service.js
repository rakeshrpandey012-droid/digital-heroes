// services/notificationService.js
const nodemailer = require("nodemailer");
const io = require("../socket");
const Notification = require("../models/Notification");

// Email transporter configuration
const emailTransporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

class NotificationService {
  /**
   * Send real-time notification + store in DB
   */
  static async sendRealTimeNotification(userId, notification) {
    try {
      const { title, message, type, data } = notification;

      // Store notification in database
      const dbNotification = await Notification.create({
        userId,
        title,
        message,
        type, // 'draw', 'winner', 'subscription', 'charity', 'achievement'
        data,
        read: false,
        createdAt: new Date(),
      });

      // Send via Socket.io
      io.to(userId).emit("notification", {
        id: dbNotification._id,
        title,
        message,
        type,
        data,
        timestamp: new Date(),
      });

      return dbNotification;
    } catch (error) {
      console.error("Error sending real-time notification:", error);
      throw error;
    }
  }

  /**
   * Send email notification
   */
  static async sendEmailNotification(recipientEmail, emailData) {
    try {
      const { subject, template, templateVars } = emailData;

      // Parse template with variables
      let htmlContent = template;
      Object.keys(templateVars).forEach(key => {
        htmlContent = htmlContent.replace(`{{${key}}}`, templateVars[key]);
      });

      const mailOptions = {
        from: process.env.EMAIL_FROM || "noreply@digitalheroes.in",
        to: recipientEmail,
        subject,
        html: htmlContent,
      };

      await emailTransporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }

  /**
   * Send winner notification
   */
  static async notifyWinner(userId, winnerData) {
    try {
      const { prizeAmount, tier, drawDate, ticketNumbers, status } = winnerData;

      // Real-time notification
      await this.sendRealTimeNotification(userId, {
        title: "🎉 You Won!",
        message: `You've won ₹${prizeAmount} in the ${drawDate} draw!`,
        type: "winner",
        data: { prizeAmount, tier, ticketNumbers, drawDate },
      });

      // Get user email
      const User = require("../models/User");
      const user = await User.findById(userId).select("email firstName");

      // Email notification
      const emailTemplate = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #fbbf24;">🎉 Congratulations {{firstName}}!</h2>
          <p>You've won <strong>₹{{prizeAmount}}</strong> in the Digital Heroes draw!</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Prize Tier:</strong> {{tier}}-Number Match</p>
            <p><strong>Draw Date:</strong> {{drawDate}}</p>
            <p><strong>Your Numbers:</strong> {{ticketNumbers}}</p>
            <p><strong>Status:</strong> Pending Verification</p>
          </div>

          <p>Please upload your score screenshot on your dashboard to verify your win.</p>
          <a href="{{dashboardUrl}}" style="background: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">
            Go to Dashboard
          </a>
        </div>
      `;

      await this.sendEmailNotification(user.email, {
        subject: `🎉 You Won ₹${prizeAmount} - Digital Heroes Draw!`,
        template: emailTemplate,
        templateVars: {
          firstName: user.firstName,
          prizeAmount,
          tier,
          drawDate,
          ticketNumbers: ticketNumbers.join(", "),
          dashboardUrl: process.env.FRONTEND_URL + "/dashboard/winnings",
        },
      });

      return true;
    } catch (error) {
      console.error("Error notifying winner:", error);
      throw error;
    }
  }

  /**
   * Send draw countdown notification (24 hours before)
   */
  static async sendDrawCountdownNotification(drawData) {
    try {
      const User = require("../models/User");
      const activeUsers = await User.find({
        "subscription.status": "active",
      }).select("_id email firstName");

      const drawDate = new Date(drawData.scheduledDate).toLocaleDateString(
        "en-IN",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      );

      const emailTemplate = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">⏰ Draw Countdown: 24 Hours Remaining!</h2>
          <p>Hi {{firstName}},</p>
          
          <p>The next Digital Heroes draw is happening in <strong>24 hours</strong>!</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Draw Date & Time:</strong> {{drawDate}}</p>
            <p><strong>Prize Pool:</strong> ₹{{prizePool}}</p>
            <p><strong>Your Entries:</strong> {{entries}}</p>
          </div>

          <p>Make sure your latest scores are entered for the draw!</p>
          <a href="{{scoreEntryUrl}}" style="background: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">
            Enter Your Scores
          </a>
        </div>
      `;

      // Send to all active users
      for (const user of activeUsers) {
        // Real-time notification
        io.to(user._id.toString()).emit("notification", {
          title: "⏰ Draw Countdown",
          message: `Next draw in 24 hours - ${drawDate}`,
          type: "draw",
          data: drawData,
        });

        // Email notification
        await this.sendEmailNotification(user.email, {
          subject: "⏰ Digital Heroes Draw - 24 Hours Countdown",
          template: emailTemplate,
          templateVars: {
            firstName: user.firstName,
            drawDate,
            prizePool: drawData.estimatedPrizePool,
            entries: drawData.totalEntries || "TBD",
            scoreEntryUrl: process.env.FRONTEND_URL + "/dashboard/scores",
          },
        });
      }

      return true;
    } catch (error) {
      console.error("Error sending draw countdown notification:", error);
      throw error;
    }
  }

  /**
   * Send subscription renewal reminder
   */
  static async sendSubscriptionReminder(userId, daysUntilExpiry) {
    try {
      const User = require("../models/User");
      const user = await User.findById(userId).select(
        "email firstName subscription"
      );

      const message =
        daysUntilExpiry === 0
          ? "Your subscription expires today!"
          : `Your subscription expires in ${daysUntilExpiry} days`;

      await this.sendRealTimeNotification(userId, {
        title: "📋 Subscription Reminder",
        message,
        type: "subscription",
        data: { daysUntilExpiry, plan: user.subscription.plan },
      });

      const emailTemplate = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f97316;">📋 Subscription Renewal Reminder</h2>
          <p>Hi {{firstName}},</p>
          
          <p>{{message}}</p>
          
          <p>Your {{plan}} plan provides you with:</p>
          <ul>
            <li>Participation in monthly draws</li>
            <li>Score tracking and leaderboard ranking</li>
            <li>Automatic charity contributions</li>
          </ul>

          <a href="{{renewalUrl}}" style="background: #f97316; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block;">
            Renew Your Subscription
          </a>
        </div>
      `;

      await this.sendEmailNotification(user.email, {
        subject:
          daysUntilExpiry === 0
            ? "⚠️ Subscription Expires Today"
            : `📋 Renew Your Subscription in ${daysUntilExpiry} Days`,
        template: emailTemplate,
        templateVars: {
          firstName: user.firstName,
          message,
          plan: user.subscription.plan.toUpperCase(),
          renewalUrl: process.env.FRONTEND_URL + "/dashboard/subscription",
        },
      });

      return true;
    } catch (error) {
      console.error("Error sending subscription reminder:", error);
      throw error;
    }
  }

  /**
   * Send achievement badge notification
   */
  static async sendAchievementNotification(userId, achievement) {
    try {
      const { name, description, badge, reward } = achievement;

      await this.sendRealTimeNotification(userId, {
        title: `🏅 Achievement Unlocked!`,
        message: `${name}: ${description}`,
        type: "achievement",
        data: { badge, reward },
      });

      return true;
    } catch (error) {
      console.error("Error sending achievement notification:", error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId) {
    try {
      await Notification.findByIdAndUpdate(notificationId, { read: true });
      return true;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  /**
   * Get user's notifications
   */
  static async getUserNotifications(userId, limit = 20) {
    try {
      return await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  }

  /**
   * Clear all notifications for user
   */
  static async clearAllNotifications(userId) {
    try {
      await Notification.deleteMany({ userId });
      return true;
    } catch (error) {
      console.error("Error clearing notifications:", error);
      throw error;
    }
  }
}

module.exports = NotificationService;
