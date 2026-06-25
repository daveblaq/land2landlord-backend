# Mailchimp Lead Integration Setup Guide

This guide walks you through the steps to get your **Mailchimp API Key** and **Audience List ID (Audience ID)** and configure them on the Landlord2Landlord backend to push leads automatically.

---

## Step 1: Create a Mailchimp Account
1. Go to [Mailchimp's Website](https://mailchimp.com) and register for an account (if you don't have one already).
2. Choose a pricing plan. The **Free** plan includes one Audience list, which is sufficient for basic lead capture tracking.

---

## Step 2: Generate a Mailchimp API Key
1. Log in to your Mailchimp dashboard.
2. Click on your **User Profile Icon** in the bottom-left corner of the sidebar, then select **Profile**.
3. In the profile navigation bar, click on **Extras** and select **API keys** from the dropdown menu.
4. Scroll down to the **Your API keys** section and click the **Create A Key** button.
5. Give your key a descriptive label (e.g., `L2L Landlords API Backend`).
6. Click **Generate Key**, then click **Copy to clipboard** to copy your new API key.
   > [!IMPORTANT]
   > Keep your API key private. Do not commit it to version control systems like GitHub.
   > 
   > Note: Your API key will look like `abc123abc123abc123abc123-us21`. The suffix after the hyphen (e.g., `-us21`) is your Mailchimp datacenter (`dc`).

---

## Step 3: Find Your Audience List ID (Audience ID)
1. In the Mailchimp left-hand sidebar, click directly on the main **Audience** header (the top icon with people, highlighted in your sidebar).
2. If you see an audience overview page, click the **Manage Audience** dropdown button on the right-hand side of the page and select **Settings**.
   - *Alternative*: If you are taken directly to the contacts list, click the **Settings** dropdown menu (located above the contacts table next to "Manage contacts") and select **Audience name and defaults**.
3. On the **Audience name and defaults** settings page, look under the **Audience ID** section.
4. You will see a string of characters labeled **Audience ID** (e.g. `a1b2c3d4e5`). This 10-character alphanumeric code is what you need.
   > [!NOTE]
   > This is **NOT** your Audience name. It is a unique internal string used by the API.

---

## Step 4: Configure Environment Variables
1. Open your project's `.env` file inside the `landlord-backend` folder.
2. Add the following keys at the bottom of the file:
   ```env
   # Mailchimp Integration Credentials
   MAILCHIMP_API_KEY=your_mailchimp_api_key_here
   MAILCHIMP_AUDIENCE_ID=your_mailchimp_audience_id_here
   ```
   *Replace `your_mailchimp_api_key_here` and `your_mailchimp_audience_id_here` with the credentials retrieved in the previous steps.*
3. Restart the backend development server to load the new environment configuration.

---

## Technical Details

- **Non-blocking Operations**: The application routes leads in the background without waiting for the Mailchimp API to respond, ensuring zero latency impact for customers submitting leads.
- **Fail-Safe Design**: If credentials are missing or Mailchimp's server responds with an error, the backend logs the error details gracefully using `pino` and continues processing, ensuring lead storage in the local database remains unaffected.
