const fs = require('fs');
const { chromium } = require('playwright');
const path = require('path');

const BASE_URL = 'https://app.gata.xyz/dataAgent';
const ACTIVITY_INTERVAL = 120000; // 2 minutos
const RESTART_INTERVAL = 60 * 60 * 1000; // 1 hora
const PAGE_TIMEOUT = 120000;
const SCREENSHOT_PATH = 'screenshot_debug.png';

const accounts = JSON.parse(fs.readFileSync('accounts.json', 'utf8'));
const proxies = fs.existsSync('proxies.txt') ? fs.readFileSync('proxies.txt', 'utf8').split(/\r?\n/).filter(p => p.trim()) : [];

async function setRequiredLocalStorage(page, account) {
    await page.evaluate((account) => {
        localStorage.setItem(account.address, account.bearer);
        localStorage.setItem('AGG_USER_IS_LOGIN', '1');
        localStorage.setItem('Gata_Chat_GotIt', '1');
        localStorage.setItem('aggr_current_address', account.address);
        localStorage.setItem(`aggr_llm_token_${account.address}`, account.llm_token);
        localStorage.setItem(`aggr_task_token_${account.address}`, account.task_token);
        localStorage.setItem(`invite_code_${account.address}`, account.invite_code);
        localStorage.setItem('wagmi.recentConnectorId', '"metaMask"');
    }, account);
    console.log(`[✔️] LocalStorage configurado para ${account.address}`);
}

async function findAndClickStartButton(page) {
    console.log('[🔎] Procurando botão "Start"...');
    try {
        await page.waitForTimeout(8000);
        await page.screenshot({ path: SCREENSHOT_PATH });
        console.log(`[📸] Screenshot salva em ${SCREENSHOT_PATH} para depuração`);

        const buttonFound = await page.evaluate(() => {
            const isVisible = (elem) => {
                if (!elem) return false;
                const style = window.getComputedStyle(elem);
                return style.display !== 'none' &&
                       style.visibility !== 'hidden' &&
                       style.opacity !== '0' &&
                       elem.offsetParent !== null;
            };
            const relevantTexts = ['start', 'begin', 'launch', 'dva', 'verify'];
            const elements = Array.from(document.querySelectorAll('button, div[role="button"], a[role="button"], div[class*="button"]'));
            for (const element of elements) {
                const text = element.innerText.toLowerCase().trim();
                if (isVisible(element) && relevantTexts.some(t => text.includes(t))) {
                    element.click();
                    return true;
                }
            }
            return false;
        });
        if (buttonFound) {
            console.log('[✔️] Botão "Start" encontrado e clicado!');
            return true;
        } else {
            console.log('[⚠️] Botão "Start" não encontrado! Verifique o screenshot.');
            return false;
        }
    } catch (error) {
        console.error('[❌] Erro ao procurar botão:', error);
        return false;
    }
}

async function ensureCorrectPage(page) {
    console.log('[🔄] Verificando URL atual...');
    let currentUrl = page.url();
    if (!currentUrl.includes('/dataAgent')) {
        console.log(`[⚠️] Página incorreta detectada (${currentUrl}). Redirecionando para ${BASE_URL}...`);
        await page.goto(BASE_URL, { timeout: PAGE_TIMEOUT });
        await page.waitForTimeout(5000);
    } else {
        console.log('[✔️] Página correta carregada.');
    }
}

async function simulateActivity(page) {
    try {
        await page.evaluate(() => {
            window.scrollTo(0, 500);
            setTimeout(() => window.scrollTo(0, 0), 1000);
        });
        console.log(`[✔️] Atividade simulada às ${new Date().toLocaleTimeString()}`);
    } catch (error) {
        console.error('[❌] Erro ao simular atividade:', error.message);
    }
}

async function restartBot(account, proxy) {
    console.log('[🔄] Reiniciando bot após 1 hora...');
    await runBot(account, proxy);
}

async function runBot(account, proxy) {
    console.log(`[🚀] Iniciando bot para ${account.address} usando proxy: ${proxy || 'Nenhum'}`);
    const browser = await chromium.launch({
        headless: true,
        args: proxy ? [`--proxy-server=${proxy}`, '--no-sandbox', '--disable-setuid-sandbox'] : ['--no-sandbox']
    });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 800 },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();
    try {
        console.log(`[🔄] Acessando ${BASE_URL}...`);
        await page.goto(BASE_URL, { timeout: PAGE_TIMEOUT });
        await page.waitForTimeout(5000);
        await ensureCorrectPage(page);
        await setRequiredLocalStorage(page, account);
        await page.reload({ waitUntil: 'load' });
        await ensureCorrectPage(page);
        await page.waitForTimeout(5000);
        const buttonClicked = await findAndClickStartButton(page);
        if (buttonClicked) {
            console.log(`[✔️] Botão Start clicado. Mantendo sessão ativa...`);
            setInterval(async () => {
                await restartBot(account, proxy);
            }, RESTART_INTERVAL);
            while (true) {
                await simulateActivity(page);
                await page.waitForTimeout(ACTIVITY_INTERVAL);
            }
        } else {
            console.error(`[❌] Falha ao iniciar ${account.address}.`);
            await browser.close();
        }
    } catch (error) {
        console.error(`[❌] Erro geral:`, error);
        await browser.close();
    }
}

async function main() {
    console.log('Deseja rodar com proxies? (sim/não):');
    process.stdin.once('data', async (input) => {
        const useProxies = input.toString().trim().toLowerCase() === 'sim';
        console.log(`[⚡] Modo de execução: ${useProxies ? 'Com Proxies' : 'Sem Proxies'}`);
        for (let i = 0; i < accounts.length; i++) {
            const account = accounts[i];
            const proxy = useProxies ? proxies[i] || null : null;
            runBot(account, proxy);
        }
    });
}

main().catch(console.error);