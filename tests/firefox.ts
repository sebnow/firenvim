require("geckodriver");

const env = require("process").env;
const fs = require("fs");
const path = require("path");
const webdriver = require("selenium-webdriver");
const Until = webdriver.until;
const By = webdriver.By;
const Options = require("selenium-webdriver/firefox").Options

import {
 extensionDir,
 getNewestFileMatching,
 killDriver,
 testAce,
 testCodemirror,
 testDynamicTextareas,
 testGStartedByFirenvim,
 testGuifont,
 testInputFocus,
 testInputFocusedAfterLeave,
 testLargeBuffers,
 testModifiers,
 testMonaco,
 testNestedDynamicTextareas,
 testPageFocus,
 testPressKeys,
 testTakeoverEmpty,
 testTakeoverNonEmpty,
 testTakeoverOnce,
 testVimrcFailure,
} from "./_common"
import { setupVimrc } from "./_vimrc";

describe("Firefox", () => {

        let driver: any = undefined

        beforeAll(async () => {
                setupVimrc();
                const extensionPath = await getNewestFileMatching(path.join(extensionDir, "xpi"), ".*.zip");

                // Temporary workaround until
                // https://github.com/SeleniumHQ/selenium/pull/7464 is merged
                let xpiPath: string
                if (extensionPath !== undefined) {
                        xpiPath = extensionPath.replace(/\.zip$/, ".xpi");
                        fs.renameSync(extensionPath, xpiPath);
                } else {
                        xpiPath = await getNewestFileMatching(path.join(extensionDir, "xpi"), ".*.xpi");
                }

                const options = (new Options())
                        .setPreference("xpinstall.signatures.required", false)
                        .addExtensions(xpiPath);

                if (env["HEADLESS"]) {
                        options.headless();
                }

                if (env["APPVEYOR"]) {
                        options.setBinary("C:\\Program Files\\Firefox Developer Edition\\firefox.exe");
                }

                driver = new webdriver.Builder()
                        .forBrowser("firefox")
                        .setFirefoxOptions(options)
                        .build();
                return driver.getCapabilities().then((cap: any) => {
                        console.log(`${cap.getBrowserName()} ${cap.getBrowserVersion()} ${xpiPath}`);
                });
        });

        afterAll(() => killDriver(driver));

        test("Firenvim modifiers work", () => testModifiers(driver));
        test("Firenvim frame disappears on buggy vimrc", () => testVimrcFailure(driver));
        test("Firenvim works on Ace", () => testAce(driver));
        test("Firenvim works on CodeMirror", () => testCodemirror(driver));
        test("Firenvim works on Monaco", () => testMonaco(driver));
        test("Firenvim works on dynamically created elements", () => testDynamicTextareas(driver));
        test("Firenvim works on dynamically created nested elements", () => testNestedDynamicTextareas(driver));
        test("Firenvim works with large buffers", () => testLargeBuffers(driver));
        test("g:started_by_firenvim exists", () => testGStartedByFirenvim(driver));
        test("Guifont works", () => testGuifont(driver));
        test("Input is focused after leaving frame", () => testInputFocusedAfterLeave(driver));
        test("InputFocus works", () => testInputFocus(driver));
        test("PageFocus works", () => testPageFocus(driver));
        test("PressKeys works", () => testPressKeys(driver));
        test("Takeover: empty works", () => testTakeoverEmpty(driver));
        test("Takeover: nonempty works", () => testTakeoverNonEmpty(driver));
        test("Takeover: once works", () => testTakeoverOnce(driver));
})
