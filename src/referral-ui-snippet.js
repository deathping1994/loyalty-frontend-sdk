import signupscreen from "./components/referral-ui-snippet/signup-screen.html"
import overlaymodal from "./components/referral-ui-snippet/overlay-modal.html"
import loadingscreen from "./components/loading-screen.html"
import inviteandearnpopup from "./components/referral-ui-snippet/invite-and-earn-popup.html"
import { injectVariablesToHTML } from "./utils/utils"

(function loadfont() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap';
    document.head.appendChild(link);
})();

(function loadGlobalStyles() {
    const styles = document.createElement('style');
    styles.innerHTML = `
        .fc-no-scroll {
            overflow: hidden;
        }
    `;
    document.body.appendChild(styles);
})();


// Load the HTML content into the shadow DOM
const container = document.createElement('div');
container.style.display = 'block';
container.style.all = 'initial';
const shadowRoot = container.attachShadow({ mode: 'open' });
shadowRoot.innerHTML = `
${signupscreen}
`
document.querySelector('#fc-wallet-referral-snippet-ui-19212').innerHTML = '';
document.querySelector('#fc-wallet-referral-snippet-ui-19212').appendChild(container);


function showLoadingScreen(showLoader) {
    if (showLoader) {
        const loadingBackDrop = document.createElement('div');
        loadingBackDrop.innerHTML = `${loadingscreen}`;
        shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay')?.appendChild(loadingBackDrop);
        const scrolled = shadowRoot?.querySelector('.fw_points__overlay.show_overlay')?.scrollTop;
        shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .fw-loading-screen-wrapper').style.top = `${scrolled}px`;
    } else {
        const loadingBackDrop = shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .fw-loading-screen-wrapper');
        loadingBackDrop?.parentNode?.removeChild(loadingBackDrop);
    }

}

async function setTheme({ client_id }) {
    const themeDetailsRes = await fetch(`${process.env.WALLET_API_URI}/get-theme-details`, {
        "method": "POST",
        "headers": {
            "Content-Type": "application/json"
        },
        "body": JSON.stringify({
            client_id: client_id
        })
    });
    const themeDetails = await themeDetailsRes.json();

    var cssVariablesScope = shadowRoot.querySelector('.fw_points__overlay');

    if (cssVariablesScope && themeDetails?.data?.theme_color) {

        cssVariablesScope.style.setProperty('--loyalty_popup_theme_background', themeDetails?.data?.theme_color);

        if (themeDetails?.data?.coin_icon) {
            cssVariablesScope.style.setProperty('--coin-svg-url', `url("${themeDetails?.data?.coin_icon}")`);
            cssVariablesScope.style.setProperty('--coin-svg-inverted-url', `url("${themeDetails?.data?.coin_icon}")`);
        } else {
            cssVariablesScope.style.setProperty('--coin-svg-url', `url("https://media.farziengineer.co/farziwallet/coin-icon.png")`);
            cssVariablesScope.style.setProperty('--coin-svg-inverted-url', `url("https://media.farziengineer.co/farziwallet/coin-icon.png")`);
        }
    }

    if (themeDetails?.data?.coin_name) {
        window.fc_loyalty_vars = {
            coin_name: themeDetails?.data?.coin_name
        }
    } else {
        window.fc_loyalty_vars = {
            coin_name: "FC"
        }
    }

    const clientCustomStyleData = themeDetails?.data?.custom_css;
    if (clientCustomStyleData) {
        var clientCustomStyleElement = `
        <style>
        ${clientCustomStyleData}
        </style>
        `;
        shadowRoot.querySelector('.fw_points').nextSibling.nextSibling.insertAdjacentHTML("afterend", clientCustomStyleElement);
    }

    shadowRoot.querySelector('.fw_points').style.display = 'flex';//widget visible only after custom styles are applied

    return {
        login_page_url: themeDetails?.data?.login_page
    }

}

function showAlertPopup(message, severity) {
    var alertElement = document.createElement('div');
    alertElement.className = 'fw-wallet-alert-popup';

    if (severity === "error") {
        alertElement.innerHTML = `<svg focusable="false" class="fw-wallet-alert-popup-error" aria-hidden="true" viewBox="0 0 24 24" data-testid="ErrorOutlineIcon"><path d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"></path></svg>
        <p>${message || "something went wrong"}</p>`;
    }

    shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay').appendChild(alertElement);

    setTimeout(function () {
        alertElement.remove();
    }, 3000);
}

(function main() {

    const mainScript = document.querySelector('#fc-wallet-referral-snippet-ui-script-19212');
    const platform_type = mainScript.getAttribute('platform-type');

    async function loggedIn(fetchThemeDetails = true) {
        showLoadingScreen(true);

        const customer_id = mainScript.getAttribute('data-customer-id');
        const customer_tags = mainScript.getAttribute('data-customer-tag')?.trim();
        const client_id = mainScript.getAttribute('data-client-id');

        if (customer_id) {
            if (fetchThemeDetails) {
                await setTheme({ client_id });
            }

            const response = await fetch(`${process.env.WALLET_API_URI}/user-walletlogs`, {
                "method": "POST",
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": JSON.stringify({
                    customer_id: customer_id,
                    user_hash: customer_tags,
                    client_id: client_id
                })
            });
            let walletData = await response.json()
            let walletAmount = walletData?.data?.data?.wallet?.wallet?.amount || 0;

            if (!walletData?.data?.data?.wallet?.wallet?.id) {
                await fetch(`${process.env.WALLET_API_URI}/sync-external-user`, {
                    "method": "POST",
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": JSON.stringify({
                        customer_id: customer_id,
                        user_hash: customer_tags,
                        client_id: client_id
                    })
                });

                const response = await fetch(`${process.env.WALLET_API_URI}/user-walletlogs`, {
                    "method": "POST",
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": JSON.stringify({
                        customer_id: customer_id,
                        user_hash: customer_tags,
                        client_id: client_id
                    })
                });
                walletData = await response.json();
                walletAmount = walletData?.data?.data?.wallet?.wallet?.amount || 0;
            }
            (async function inviteFriends() {

                let overLayScreenUnlockCode = injectVariablesToHTML(overlaymodal, ".content", inviteandearnpopup)

                overLayScreenUnlockCode = injectVariablesToHTML(overLayScreenUnlockCode, ".unlock-desc.invite-and-earn", `Every time you successfully refer friend.
            You get 200 ${window.fc_loyalty_vars.coin_name || ''} Coins & they get 100 ${window.fc_loyalty_vars.coin_name || ''} Coins`)


                const overlay = shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay');

                overlay.innerHTML = overLayScreenUnlockCode;

                showLoadingScreen(true);

                const referralCodeRes = await fetch(`${process.env.WALLET_API_URI}/get-referral-code`, {
                    "method": "POST",
                    "headers": {
                        "Content-Type": "application/json"
                    },
                    "body": JSON.stringify({
                        "customer_id": customer_id,
                        "user_hash": customer_tags,
                        "client_id": client_id
                    })
                });
                const referralCodeData = await referralCodeRes.json();
                const referralLink = `${window.location.origin}${referralCodeData?.data?.path}`

                shadowRoot.querySelector('.fw_points__overlay .overlay_modal .invite-and-earn-popup .revealed-code p').innerHTML = referralLink;

                const socialContainerHTML = `
            <a class="socials-refer-icon-whatsapp-link"
            href="https://api.whatsapp.com/send?text=Click on the referral link below and get rewarded with 100 ${window.fc_loyalty_vars.coin_name || ''} Coins. ${referralLink}" target="_blank">
                <div class="socials-refer-icon-whatsapp">
                    <img src="https://media.farziengineer.co/farziwallet/whatsapp-icon.png" />
                    <p>Send on whatsapp</p>
                </div>
            </a>
            <a
            href="sms://18005555555/?body=Click on the referral link below and get rewarded with 100 ${window.fc_loyalty_vars.coin_name || ''} Coins. ${referralLink}" target="_blank">
                <div class="socials-refer-icon">
                    <img src="https://media.farziengineer.co/farziwallet/share-icon.png" />
                </div>
            </a>
            `

                shadowRoot.querySelector('.fw_points__overlay .overlay_modal .invite-and-earn-popup .invite-and-earn-socials-container').innerHTML = socialContainerHTML;

                showLoadingScreen(false);

                shadowRoot.querySelector('.fw_points__overlay .overlay_modal .content .unlock-coupon-card .revealed-code img').addEventListener('click', () => {
                    navigator.clipboard.writeText(referralLink);
                    const copiedBtn = shadowRoot.querySelector('.fw_points__overlay .overlay_modal .content .unlock-coupon-card.invite-and-earn-popup .revealed-code .copied-alert');

                    copiedBtn.style.display = "block";
                    copiedBtn.style.padding = "12px 16px";

                    setTimeout(() => {
                        copiedBtn.style.padding = "1px 1px";
                        copiedBtn.style.display = "none";
                    }, 1500)
                })

                // shadowRoot.querySelector('.fw_points__overlay .overlay_modal .go-back-header .go-back-header-heading').addEventListener('click', function () {

                //     (function closeOverlay() {
                //         overlay.style.height = "0%";
                //         overlay.style.bottom = "-120%";
                //         const backDrop = shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .overlay_modal_backdrop');
                //         backDrop.parentNode.removeChild(backDrop);
                //         overlay.innerHTML = '';
                //         shadowRoot.querySelector('.fw_points__overlay.show_overlay').style.overflowY = "scroll";
                //     })();

                // });
            })();
        } else if (client_id) {
            if (fetchThemeDetails) {
                var themeVars = await setTheme({ client_id });
            }



            const cardContainer = shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay');
            cardContainer.innerHTML = '<div class="login-btn"><p>Login to continue</p></div>';


            shadowRoot.querySelector('.fw_points .login-btn').addEventListener('click', function openSignInPopup() {
                shadowRoot.querySelector('.fw_points .login-btn').removeEventListener('click', openSignInPopup);
                location.href = themeVars?.login_page_url || "/account/login";
            })
        }
    }

    if (platform_type !== "SPA") {
        if (document.readyState === "complete") {
            loggedIn();
        } else {
            window.addEventListener("load", loggedIn);
        }
    }
})();

