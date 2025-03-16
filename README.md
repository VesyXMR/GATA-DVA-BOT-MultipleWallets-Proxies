# Gata Auto Bot

## Description
The Gata Auto Bot is an automated script designed to interact with the Gata.xyz website. It automates the login process using credentials from multiple accounts, navigates to the Data Agent (DVA) task page, and automatically initiates tasks. This bot is particularly useful for users who want to maintain active sessions and perform tasks automatically across multiple accounts at once. Proxy support enables the bot to run under different IPs, circumventing potential limitations or blocks due to heavy usage.

## Features
- **Multiple Account Support**: Manages and executes tasks across several accounts simultaneously.
- **Task Automation**: Automatically navigates to and initiates required tasks.
- **Proxy Support**: Ability to use different proxies for each account, enhancing the bot’s security and effectiveness.
- **Screenshot and Debug Logging**: Saves screenshots and detailed logs for error checking or status verification.

## Prerequisites
- Node.js installed on your system.
- Playwright installed. If not already installed, you can install it using npm:

  ```bash
  npm install playwright

## Required File Structure
- `accounts.json`: Should contain an array of objects with `address`, `bearer`, `llm_token`, `task_token`, and `invite_code` for each account.
- `proxies.txt`: (Optional) A list of proxies, one per line (format: `http://username:password@ip_address:port`).

## Setup and Execution
### Setup

1.  Clone this repository or download the necessary files to your local machine:
    ```bash 
    git clone https://github.com/VesyXMR/GATA-DVA-BOT-MultipleWallets-Proxies.git

2.  Navigate to the directory where the files are located:
    ```bash
    cd path/to/directory

3.  Install the required dependencies:
    ```bash
    npm install

4. Configure the `accounts.json` file with the credentials of the accounts you wish to use.
5. (Optional) Configure the `proxies.txt` file with your proxies.

### Running the Bot
To run the bot, execute the following steps in your terminal:

1. Navigate to the directory where your project is located.

2.  Start the bot by running:
    ```bash
    node index.js

3. The bot will prompt you to choose whether to use proxies. Respond with `yes` or `no` and press Enter.
4. The bot will begin executing tasks for the accounts configured. It will log activities and errors in the terminal and save screenshots and HTML files for debugging purposes.

## License
This project is distributed under the MIT license. See the `LICENSE` file for more details.

## Contributions
Contributions are welcome! To contribute, please fork the repository, make your changes, and submit a pull request.

