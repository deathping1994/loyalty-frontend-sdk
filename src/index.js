import signupscreen from "./components/signup-screen.html"
import loggedinscreen from "./components/loggedin-screen.html"
import overlaymodal from "./components/overlay-modal.html"
import fullheightoverlaymodal from "./components/full-height-overlay-modal.html"
import couponsscreen from "./components/coupons-screen.html"
import yourcouponsscreen from "./components/your-coupons-screen.html"
import exploregamescreen from "./components/explore-game-screen.html"
import exploregamescreen2 from "./components/explore-game-screen.html"
import exploregamescreen3 from "./components/explore-game-screen.html"
import unlockcodescreen from "./components/unlock-code-screen.html"
import spinandwinscreen from "./components/spin-and-win-screen.html"
import { drawWheel } from './spin-wheel';
import scratchcardscreen from "./components/scratch-card-screen.html"
import inviteandearnpopup from "./components/invite-and-earn-popup.html"
import loadingscreen from "./components/loading-screen.html"
import { injectVariablesToHTML } from "./utils/utils"
import customdiscountcodescreen from "./components/custom-discount-code-screen.html";

(function loadfont() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap';
    document.head.appendChild(link);
})();


// Load the HTML content into the shadow DOM
const container = document.createElement('div');
container.style.display = 'block';
container.style.all = 'initial';
const shadowRoot = container.attachShadow({ mode: 'open' });
shadowRoot.innerHTML = `
${signupscreen}
`
document.body.appendChild(container);



(function popUptoggleOnAndOff() {
    var widgetButton = shadowRoot.getElementById('widget-container');
    var cardContainer = shadowRoot.getElementById('card-container');
    var headerClose = shadowRoot.getElementById('header-close');
    var closeBtn = shadowRoot.querySelector('.fw_points__overlay.show_overlay .header .header-close');

    widgetButton.addEventListener('click', function () {
        if (cardContainer.style.display === 'none') {
            cardContainer.style.display = 'block';
        } else {
            cardContainer.style.display = 'none';
        }
    });

    function closeWidgetPopup() {
        if (cardContainer.style.display === 'none') {
            cardContainer.style.display = 'block';
        } else {
            cardContainer.style.display = 'none';
        }
    }

    headerClose.addEventListener('click', closeWidgetPopup);
    closeBtn?.addEventListener('click', closeWidgetPopup);
})();

(function storeReferHash() {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const referHash = urlSearchParams.get("fc_refer_hash");
    if (referHash) {
        try {
            localStorage.setItem("fc_refer_hash", referHash);
        } catch (error) {
            console.log("error in storeReferHash", error);
        }
    }
})();

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

        const encodedColor = encodeURIComponent(themeDetails?.data?.theme_color);

        cssVariablesScope.style.setProperty('--coin-svg-url', `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='12' cy='12' r='12' fill='${encodedColor}'/%3E%3Cpath d='M11.6003 6.28047C11.6301 6.19829 11.6845 6.12728 11.7561 6.0771C11.8277 6.02692 11.913 6 12.0004 6C12.0879 6 12.1732 6.02692 12.2448 6.0771C12.3164 6.12728 12.3708 6.19829 12.4006 6.28047L12.8076 7.39245C13.1264 8.2644 13.6316 9.05626 14.2881 9.71274C14.9446 10.3692 15.7364 10.8745 16.6084 11.1933L17.7195 11.6003C17.8017 11.6301 17.8727 11.6845 17.9229 11.7561C17.9731 11.8277 18 11.913 18 12.0004C18 12.0879 17.9731 12.1732 17.9229 12.2448C17.8727 12.3164 17.8017 12.3708 17.7195 12.4006L16.6084 12.8076C15.7364 13.1264 14.9446 13.6316 14.2881 14.2881C13.6316 14.9446 13.1264 15.7364 12.8076 16.6084L12.4006 17.7195C12.3708 17.8017 12.3164 17.8727 12.2448 17.9229C12.1732 17.9731 12.0879 18 12.0004 18C11.913 18 11.8277 17.9731 11.7561 17.9229C11.6845 17.8727 11.6301 17.8017 11.6003 17.7195L11.1933 16.6084C10.8745 15.7364 10.3692 14.9446 9.71274 14.2881C9.05626 13.6316 8.2644 13.1264 7.39245 12.8076L6.28047 12.4006C6.19829 12.3708 6.12728 12.3164 6.0771 12.2448C6.02692 12.1732 6 12.0879 6 12.0004C6 11.913 6.02692 11.8277 6.0771 11.7561C6.12728 11.6845 6.19829 11.6301 6.28047 11.6003L7.39245 11.1933C8.2644 10.8745 9.05626 10.3692 9.71274 9.71274C10.3692 9.05626 10.8745 8.2644 11.1933 7.39245L11.6003 6.28047Z' fill='white'/%3E%3C/svg%3E%0A")`);

        cssVariablesScope.style.setProperty('--coin-svg-inverted-url', `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 19 19' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='9.5' cy='9.5' r='9.5' fill='white'/%3E%3Cpath d='M9.18353 4.97204C9.20715 4.90698 9.25022 4.85076 9.3069 4.81104C9.36358 4.77131 9.43112 4.75 9.50034 4.75C9.56955 4.75 9.63709 4.77131 9.69377 4.81104C9.75045 4.85076 9.79353 4.90698 9.81714 4.97204L10.1393 5.85236C10.3917 6.54265 10.7917 7.16954 11.3114 7.68925C11.8311 8.20896 12.458 8.60897 13.1483 8.86133L14.028 9.18353C14.093 9.20715 14.1492 9.25022 14.189 9.3069C14.2287 9.36358 14.25 9.43112 14.25 9.50034C14.25 9.56955 14.2287 9.63709 14.189 9.69377C14.1492 9.75045 14.093 9.79353 14.028 9.81714L13.1483 10.1393C12.458 10.3917 11.8311 10.7917 11.3114 11.3114C10.7917 11.8311 10.3917 12.458 10.1393 13.1483L9.81714 14.028C9.79353 14.093 9.75045 14.1492 9.69377 14.189C9.63709 14.2287 9.56955 14.25 9.50034 14.25C9.43112 14.25 9.36358 14.2287 9.3069 14.189C9.25022 14.1492 9.20715 14.093 9.18353 14.028L8.86133 13.1483C8.60897 12.458 8.20896 11.8311 7.68925 11.3114C7.16954 10.7917 6.54265 10.3917 5.85236 10.1393L4.97204 9.81714C4.90698 9.79353 4.85076 9.75045 4.81104 9.69377C4.77131 9.63709 4.75 9.56955 4.75 9.50034C4.75 9.43112 4.77131 9.36358 4.81104 9.3069C4.85076 9.25022 4.90698 9.20715 4.97204 9.18353L5.85236 8.86133C6.54265 8.60897 7.16954 8.20896 7.68925 7.68925C8.20896 7.16954 8.60897 6.54265 8.86133 5.85236L9.18353 4.97204Z' fill='${encodedColor}'/%3E%3C/svg%3E%0A")`);
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

async function redeemReferHash({ customer_id, customer_tags, client_id }) {
    const fc_refer_hash = localStorage.getItem("fc_refer_hash");
    const redeemed = localStorage.getItem("fc_refer_hash_redeemed")
    if (fc_refer_hash && !redeemed) {
        try {
            const response = await fetch(`${process.env.WALLET_API_URI}/redeem-referral-code`, {
                "method": "POST",
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": JSON.stringify({
                    customer_id: customer_id,
                    user_hash: customer_tags,
                    client_id: client_id,
                    refer_hash: fc_refer_hash
                })
            });
            localStorage.setItem("fc_refer_hash_redeemed", true)
        } catch (err) {
            console.log("error in redeemReferHash", err)
        }
    }
}

window.onload = async function loggedIn(fetchThemeDetails = true) {
    showLoadingScreen(true);
    const mainScript = document.querySelector('#fc-wallet-19212');
    const customer_id = mainScript.getAttribute('data-customer-id');
    const customer_tags = mainScript.getAttribute('data-customer-tag')?.trim();
    const client_id = mainScript.getAttribute('data-client-id');

    if (customer_id) {
        if (fetchThemeDetails) {
            await setTheme({ client_id });
        }

        await redeemReferHash({ customer_id, customer_tags, client_id });

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
        const walletData = await response.json()
        let walletAmount = walletData?.data?.data?.wallet?.wallet?.amount;

        const couponDataRes = await fetch(`${process.env.WALLET_API_URI}/get-featured-coupons`, {
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

        const couponDataReponse = await couponDataRes.json();
        const couponData = couponDataReponse?.data;


        let loggedInScreenHTML = injectVariablesToHTML(loggedinscreen, ".pointsBox .walletAmount", walletAmount);
        let couponCardHTML = '';
        couponData.forEach((couponItem, index) => {
            couponCardHTML += `
            <div class="card" data-coupon-idx="${index}">
                <img data-coupon-idx="${index}"
                    src="${couponItem?.image}" />
                <div data-coupon-idx="${index}" class="couponDesc">
                    <p data-coupon-idx="${index}" class="couponDesc-text">${couponItem?.title}</p>
                    <div data-coupon-idx="${index}" class="couponValue"><span class="coins-icon"></span>
                        <p>${couponItem?.amount}</p>
                    </div>
                    <div data-coupon-idx="${index}" class="floating-label">${couponItem?.label}</div>
                </div>
            </div>
            `
        });
        loggedInScreenHTML = injectVariablesToHTML(loggedInScreenHTML, ".couponCodes .cardContainer.cardRow", couponCardHTML);

        const cardContainer = shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay');
        cardContainer.innerHTML = loggedInScreenHTML;

        shadowRoot.querySelector('.fw_points__overlay.show_overlay .header #header-close')?.addEventListener('click', () => {
            const cardContainer = shadowRoot.getElementById('card-container');

            if (cardContainer.style.display === 'none') {
                cardContainer.style.display = 'block';
            } else {
                cardContainer.style.display = 'none';
            }
        })

        shadowRoot.querySelector('.fw_points__overlay.show_overlay').style.overflowY = "scroll";

        (function showPointsHistory() {
            shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .cardWrapper.points').addEventListener('click', function () {

                let walletPointsActivityHTML = '';
                walletData?.data?.data?.wallet?.wallet?.logs?.edges?.forEach((edge) => {
                    let symbol, color;
                    if (edge.node.type === "ADD") {
                        symbol = '+';
                        color = "green";
                    } else {
                        symbol = '-';
                        color = "red";
                    }

                    walletPointsActivityHTML = walletPointsActivityHTML + `
                <div class="dropDown removeBanner">
                        <div class="dropDown__content">
                            <div class="pointsRow">
                            <div class="pointsRow_reason">
                            <p class="pointsRow_reason_title" >${edge.node.reason}</p>
                            <p style="color:${color};font-weight:600;text-align: right;">${symbol}${edge.node.amount} points</p>
                            </div>
                            
                            <p class="">${new Date(edge.node.created)?.toISOString()?.split('T')?.[0]}</p>
                            </div>
                        </div>
                    </div>
                `
                });


                const overLayScreenPointsActivity = injectVariablesToHTML(fullheightoverlaymodal, ".full_height_overlay_modal .content", `<div class="pointsActivityContainer"><h4>Points activity</h4>${walletPointsActivityHTML}</div>`)

                shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay').innerHTML = overLayScreenPointsActivity;

                shadowRoot.querySelector('.fw_points__overlay .full_height_overlay_modal .go-back-header .go-back-header-heading').addEventListener('click', function () {
                    loggedIn(false);
                });
            });


        })();

        function redeemCodeOnClick() {
            shadowRoot.querySelectorAll('.fw_points__overlay .content .couponCodes .cardContainer.cardRow .card').forEach((element) => {
                element.addEventListener('click', function (event) {

                    const couponCardIndex = event.target.getAttribute("data-coupon-idx");
                    const selectedCouponData = couponCardIndex && couponData[couponCardIndex];
                    const couponAmount = selectedCouponData?.amount;
                    const couponTitle = selectedCouponData?.title;

                    let overLayScreenUnlockCode = injectVariablesToHTML(overlaymodal, ".content", unlockcodescreen)
                    overLayScreenUnlockCode = injectVariablesToHTML(overLayScreenUnlockCode, ".unlock-heading .heading-text", `${selectedCouponData?.heading}`)
                    overLayScreenUnlockCode = injectVariablesToHTML(overLayScreenUnlockCode, ".unlock-title", `${selectedCouponData?.title}`)
                    overLayScreenUnlockCode = injectVariablesToHTML(overLayScreenUnlockCode, ".unlock-text", `Unlock for ${couponAmount} OB Coins`)

                    const overlay = shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .overlay_modal');

                    overlay.innerHTML = overLayScreenUnlockCode;

                    (function openOverlay() {
                        overlay.style.height = "60%";
                        const scrolled = shadowRoot.querySelector('.fw_points__overlay.show_overlay').scrollTop;
                        overlay.style.bottom = `-${scrolled}px`;
                        const backDrop = document.createElement('div');
                        backDrop.innerHTML = `<div class="overlay_modal_backdrop"></div>`;
                        shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay').appendChild(backDrop);
                        shadowRoot.querySelector('.fw_points__overlay.show_overlay').style.overflowY = "hidden";

                    })();

                    shadowRoot.querySelector('.fw_points__overlay .overlay_modal .content .unlock-coupon-card .unlock-button').addEventListener('click', async function () {
                        showLoadingScreen(true);
                        const response = await fetch(`${process.env.WALLET_API_URI}/get-code`, {
                            "method": "POST",
                            "headers": {
                                "Content-Type": "application/json"
                            },
                            "body": JSON.stringify({
                                "customer_id": customer_id,
                                "user_hash": customer_tags,
                                "couponAmount": couponAmount,
                                "client_id": client_id,
                                "coupon_title": couponTitle
                            })
                        });
                        const couponData = await response.json();
                        if (couponData?.status !== "success") {
                            if (couponData?.error?.includes("insufficient")) {
                                showAlertPopup("insufficient funds", "error");
                            } else {
                                showAlertPopup("something went wrong", "error");
                            }
                            showLoadingScreen(false);
                        } else {
                            shadowRoot.querySelector('.fw_points__overlay .overlay_modal .content .unlock-coupon-card .unlock-button-container').innerHTML = `
                        <p class="unlock-text">Use this code at checkout</p>
                        <div class="revealed-code"><p>${couponData?.data?.coupon_code}</p><img src="https://media.farziengineer.co/farziwallet/copy-icon.png"/><p class="copied-alert">copied</p></div>
                        `;
                            showLoadingScreen(false);
                            shadowRoot.querySelector('.fw_points__overlay .overlay_modal .content .unlock-coupon-card .revealed-code img').addEventListener('click', () => {
                                navigator.clipboard.writeText(couponData?.data?.coupon_code);
                                const copiedBtn = shadowRoot.querySelector('.fw_points__overlay .overlay_modal .content .unlock-coupon-card .revealed-code .copied-alert');

                                copiedBtn.style.display = "block";
                                copiedBtn.style.padding = "12px 16px";

                                setTimeout(() => {
                                    copiedBtn.style.padding = "1px 1px";
                                    copiedBtn.style.display = "none";
                                }, 1500)
                            })

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
                            const walletData = await response.json()
                            walletAmount = walletData?.data?.data?.wallet?.wallet?.amount;
                            if (shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .cardWrapper.points .pointsBox .walletAmount')) {
                                shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .cardWrapper.points .pointsBox .walletAmount').innerHTML = walletAmount;
                            } else if (shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .top-head-points .points-wrapper')) {
                                shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .top-head-points .points-wrapper').innerHTML = walletAmount;
                            }
                        }

                    });


                    shadowRoot.querySelector('.fw_points__overlay .overlay_modal .go-back-header .go-back-header-heading').addEventListener('click', function () {

                        (function closeOverlay() {
                            overlay.style.height = "0%";
                            overlay.style.bottom = "-120%";
                            const backDrop = shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .overlay_modal_backdrop');
                            backDrop.parentNode.removeChild(backDrop);
                            overlay.innerHTML = '';
                            shadowRoot.querySelector('.fw_points__overlay.show_overlay').style.overflowY = "scroll";

                        })();

                    });
                })
            })
        };
        redeemCodeOnClick();

        (function viewAllCoupons() {
            shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .couponCodes .viewAllCoupons').addEventListener('click', async function showViewAllCouponsScreen() {
                let couponCardHTML = '';
                couponData.forEach((couponItem, index) => {
                    couponCardHTML += `
            <div class="card" data-coupon-idx="${index}">
                <img data-coupon-idx="${index}"
                    src="${couponItem?.image}" />
                <div data-coupon-idx="${index}" class="couponDesc">
                    <p data-coupon-idx="${index}" class="couponDesc-text">${couponItem?.title}</p>
                    <div data-coupon-idx="${index}" class="couponValue"><span class="coins-icon"></span>
                        <p>${couponItem?.amount}</p>
                    </div>
                    <div data-coupon-idx="${index}" class="floating-label">${couponItem?.label}</div>
                </div>
            </div>
            `
                });

                let overLayScreenPointsActivity = injectVariablesToHTML(fullheightoverlaymodal, ".full_height_overlay_modal .content", `<div class="couponsScreenContainer"><h4>Coupons</h4>
                ${couponsscreen}</div>`);

                overLayScreenPointsActivity = injectVariablesToHTML(overLayScreenPointsActivity, ".top-head .top-head-points .points-wrapper", `${walletAmount}`);

                overLayScreenPointsActivity = injectVariablesToHTML(overLayScreenPointsActivity, ".couponCodes .cardContainer.cardRow", couponCardHTML);

                shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay').innerHTML = overLayScreenPointsActivity;

                redeemCodeOnClick();

                shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .couponsScreenContainer .cardContainer .redeemCustomCoinsCard').addEventListener('click', () => {
                    let overLayScreenUnlockCode = injectVariablesToHTML(overlaymodal, ".content", customdiscountcodescreen)

                    const overlay = shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .overlay_modal');

                    overlay.innerHTML = overLayScreenUnlockCode;

                    (function openOverlay() {
                        overlay.style.height = "60%";
                        const scrolled = shadowRoot.querySelector('.fw_points__overlay.show_overlay').scrollTop;
                        overlay.style.bottom = `-${scrolled}px`;
                        const backDrop = document.createElement('div');
                        backDrop.innerHTML = `<div class="overlay_modal_backdrop"></div>`;
                        shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay').appendChild(backDrop);
                        shadowRoot.querySelector('.fw_points__overlay.show_overlay').style.overflowY = "hidden";

                    })();

                    shadowRoot.querySelector('.fw_points__overlay .overlay_modal .unlock-coupon-card .unlock-button-container #fw-redeem-ob-range').addEventListener('change', () => {
                        const value = shadowRoot.querySelector('.fw_points__overlay .overlay_modal .unlock-coupon-card .unlock-button-container #fw-redeem-ob-range').value

                        shadowRoot.querySelector('.fw_points__overlay .overlay_modal .unlock-coupon-card .unlock-desc').innerHTML = `${value} OB Coins for ₹${value} off`
                    })

                    shadowRoot.querySelector('.fw_points__overlay .overlay_modal .unlock-coupon-card .unlock-button-container .unlock-button').addEventListener('click', async () => {
                        const value = shadowRoot.querySelector('.fw_points__overlay .overlay_modal .unlock-coupon-card .unlock-button-container #fw-redeem-ob-range').value

                        showLoadingScreen(true);
                        const response = await fetch(`${process.env.WALLET_API_URI}/get-code`, {
                            "method": "POST",
                            "headers": {
                                "Content-Type": "application/json"
                            },
                            "body": JSON.stringify({
                                "customer_id": customer_id,
                                "user_hash": customer_tags,
                                "couponAmount": parseInt(value),
                                "client_id": client_id,
                                "coupon_title": `Custom Discount: ${value} OB Coins for ₹${value} off`
                            })
                        });
                        const couponData = await response.json();
                        if (couponData?.status !== "success") {
                            if (couponData?.error?.includes("insufficient")) {
                                showAlertPopup("insufficient funds", "error");
                            } else {
                                showAlertPopup("something went wrong", "error");
                            }
                            showLoadingScreen(false);
                        } else {
                            shadowRoot.querySelector('.fw_points__overlay .overlay_modal .content .unlock-coupon-card .unlock-button-container').innerHTML = `
                        <p class="unlock-text">Use this code at checkout</p>
                        <div class="revealed-code"><p>${couponData?.data?.coupon_code}</p><img src="https://media.farziengineer.co/farziwallet/copy-icon.png"/><p class="copied-alert">copied</p></div>
                        `;
                            showLoadingScreen(false);
                            shadowRoot.querySelector('.fw_points__overlay .overlay_modal .content .unlock-coupon-card .revealed-code img').addEventListener('click', () => {
                                navigator.clipboard.writeText(couponData?.data?.coupon_code);
                                const copiedBtn = shadowRoot.querySelector('.fw_points__overlay .overlay_modal .content .unlock-coupon-card .revealed-code .copied-alert');

                                copiedBtn.style.display = "block";
                                copiedBtn.style.padding = "12px 16px";

                                setTimeout(() => {
                                    copiedBtn.style.padding = "1px 1px";
                                    copiedBtn.style.display = "none";
                                }, 1500)
                            })

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
                            const walletData = await response.json()
                            walletAmount = walletData?.data?.data?.wallet?.wallet?.amount;
                            if (shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .cardWrapper.points .pointsBox .walletAmount')) {
                                shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .cardWrapper.points .pointsBox .walletAmount').innerHTML = walletAmount;
                            } else if (shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .top-head-points .points-wrapper')) {
                                shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .top-head-points .points-wrapper').innerHTML = walletAmount;
                            }
                        }
                    })


                    shadowRoot.querySelector('.fw_points__overlay .overlay_modal .go-back-header .go-back-header-heading').addEventListener('click', function () {

                        (function closeOverlay() {
                            overlay.style.height = "0%";
                            overlay.style.bottom = "-120%";
                            const backDrop = shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .overlay_modal_backdrop');
                            backDrop.parentNode.removeChild(backDrop);
                            overlay.innerHTML = '';
                            shadowRoot.querySelector('.fw_points__overlay.show_overlay').style.overflowY = "scroll";

                        })();

                    });
                })

                showLoadingScreen(true);
                const couponToExploreRes = await fetch(`${process.env.WALLET_API_URI}/get-coupons-to-explore`, {
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

                const couponToExploreResponse = await couponToExploreRes.json();
                const couponToExploreData = couponToExploreResponse?.data?.data;
                showLoadingScreen(false);


                if (couponToExploreResponse?.data?.enable && couponToExploreData) {
                    const couponToExploreHeadingHTMLContainer = document.createElement("div");
                    const couponToExploreHeadingHTML = `
                    <div class="cardContainer">
                        <div class="rowHead">
                            <p>Coupons to Explore</p>
                        </div>
                    </div>
                    `;
                    couponToExploreHeadingHTMLContainer.innerHTML = couponToExploreHeadingHTML;
                    shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .couponsScreenContainer .redeemCoins').appendChild(couponToExploreHeadingHTMLContainer);

                    let couponToExploreHTML = '';
                    couponToExploreData.forEach((couponItem, index) => {
                        couponToExploreHTML += `
                        <div data-coupon-idx="${index}" class="cardContainer cardRow">
                            <div data-coupon-idx="${index}" class="redeemCoinsCard">
                                <div data-coupon-idx="${index}" class="redeemCoinsImg"><img data-coupon-idx="${index}" src="${couponItem?.image}" />
                                </div>
                                <div data-coupon-idx="${index}" class="redeemCoinsText">
                                    <h5 data-coupon-idx="${index}">${couponItem?.heading}</h5>
                                    <p data-coupon-idx="${index}">Unlock for <span data-coupon-idx="${index}" class="coins-icon"></span> ${couponItem?.amount}</p>
                                </div>
                            </div>
                        </div>
                    `});

                    const couponToExploreHTMLContainer = document.createElement('div');
                    couponToExploreHTMLContainer.innerHTML = couponToExploreHTML;
                    shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .couponsScreenContainer .redeemCoins').appendChild(couponToExploreHTMLContainer);



                    shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .couponsScreenContainer .redeemCoins .cardContainer.cardRow .redeemCoinsCard').addEventListener('click', (event) => {
                        const couponToExpIndex = event.target.getAttribute("data-coupon-idx");
                        const selectedcouponToExpData = couponToExpIndex && couponToExploreData[couponToExpIndex];
                        const couponAmount = selectedcouponToExpData?.amount;
                        const couponTitle = selectedcouponToExpData?.title;
                        const couponHeading = selectedcouponToExpData?.heading;

                        let overLayScreenUnlockCode = injectVariablesToHTML(overlaymodal, ".content", unlockcodescreen)
                        overLayScreenUnlockCode = injectVariablesToHTML(overLayScreenUnlockCode, ".unlock-heading .heading-text", couponHeading)
                        overLayScreenUnlockCode = injectVariablesToHTML(overLayScreenUnlockCode, ".unlock-title", couponTitle)
                        overLayScreenUnlockCode = injectVariablesToHTML(overLayScreenUnlockCode, ".unlock-text", `Unlock for ${couponAmount} OB Coins`)

                        const overlay = shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .overlay_modal');

                        overlay.innerHTML = overLayScreenUnlockCode;

                        (function openOverlay() {
                            overlay.style.height = "60%";
                            const scrolled = shadowRoot.querySelector('.fw_points__overlay.show_overlay').scrollTop;
                            overlay.style.bottom = `-${scrolled}px`;
                            const backDrop = document.createElement('div');
                            backDrop.innerHTML = `<div class="overlay_modal_backdrop"></div>`;
                            shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay').appendChild(backDrop);
                            shadowRoot.querySelector('.fw_points__overlay.show_overlay').style.overflowY = "hidden";

                        })();

                        shadowRoot.querySelector('.fw_points__overlay .overlay_modal .content .unlock-coupon-card .unlock-button').addEventListener('click', async function () {
                            showLoadingScreen(true);
                            const response = await fetch(`${process.env.WALLET_API_URI}/get-code`, {
                                "method": "POST",
                                "headers": {
                                    "Content-Type": "application/json"
                                },
                                "body": JSON.stringify({
                                    "customer_id": customer_id,
                                    "user_hash": customer_tags,
                                    "couponAmount": couponAmount,
                                    "client_id": client_id,
                                    "coupon_title": couponTitle
                                })
                            });
                            const couponData = await response.json();
                            if (couponData?.status !== "success") {
                                if (couponData?.error?.includes("insufficient")) {
                                    showAlertPopup("insufficient funds", "error");
                                } else {
                                    showAlertPopup("something went wrong", "error");
                                }
                                showLoadingScreen(false);
                            } else {
                                shadowRoot.querySelector('.fw_points__overlay .overlay_modal .content .unlock-coupon-card .unlock-button-container').innerHTML = `
                        <p class="unlock-text">Use this code at checkout</p>
                        <div class="revealed-code"><p>${couponData?.data?.coupon_code}</p><img src="https://media.farziengineer.co/farziwallet/copy-icon.png"/><p class="copied-alert">copied</p></div>
                        `;
                                showLoadingScreen(false);
                                shadowRoot.querySelector('.fw_points__overlay .overlay_modal .content .unlock-coupon-card .revealed-code img').addEventListener('click', () => {
                                    navigator.clipboard.writeText(couponData?.data?.coupon_code);
                                    const copiedBtn = shadowRoot.querySelector('.fw_points__overlay .overlay_modal .content .unlock-coupon-card .revealed-code .copied-alert');

                                    copiedBtn.style.display = "block";
                                    copiedBtn.style.padding = "12px 16px";

                                    setTimeout(() => {
                                        copiedBtn.style.padding = "1px 1px";
                                        copiedBtn.style.display = "none";
                                    }, 1500)
                                })

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
                                const walletData = await response.json()
                                walletAmount = walletData?.data?.data?.wallet?.wallet?.amount;
                                if (shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .cardWrapper.points .pointsBox .walletAmount')) {
                                    shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .cardWrapper.points .pointsBox .walletAmount').innerHTML = walletAmount;
                                } else if (shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .top-head-points .points-wrapper')) {
                                    shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .top-head-points .points-wrapper').innerHTML = walletAmount;
                                }
                            }

                        });

                        shadowRoot.querySelector('.fw_points__overlay .overlay_modal .go-back-header .go-back-header-heading').addEventListener('click', function () {

                            (function closeOverlay() {
                                overlay.style.height = "0%";
                                overlay.style.bottom = "-120%";
                                const backDrop = shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .overlay_modal_backdrop');
                                backDrop.parentNode.removeChild(backDrop);
                                overlay.innerHTML = '';
                                shadowRoot.querySelector('.fw_points__overlay.show_overlay').style.overflowY = "scroll";

                            })();

                        });
                    })
                }

                const availableCouponsTab = shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .couponsScreenContainer .top-head-tabs #available-coupons-screen');

                const yourCouponsTab = shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .couponsScreenContainer .top-head-tabs #your-coupons-screen');

                availableCouponsTab.addEventListener('click', () => {
                    yourCouponsTab.classList.remove("active-tab");
                    availableCouponsTab.classList.add("active-tab");
                    viewAllCoupons();
                })

                yourCouponsTab.addEventListener('click', async function showYourCouponsTab() {
                    let overLayScreenPointsActivityYourCoupons = injectVariablesToHTML(fullheightoverlaymodal, ".full_height_overlay_modal .content", `<div class="couponsScreenContainer"><h4>Coupons</h4>
                ${yourcouponsscreen}</div>`);

                    overLayScreenPointsActivityYourCoupons = injectVariablesToHTML(overLayScreenPointsActivityYourCoupons, ".top-head .top-head-points .points-wrapper", `${walletAmount}`);

                    shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay').innerHTML = overLayScreenPointsActivityYourCoupons;

                    showLoadingScreen(true);

                    const userCouponResponse = await fetch(`${process.env.WALLET_API_URI}/get-user-coupons`, {
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

                    const userCoupon = await userCouponResponse.json();
                    const unlockedCoupons = userCoupon?.data?.unlocked;

                    showLoadingScreen(false);

                    let UnlockedCouponsHTML = '';
                    if (unlockedCoupons?.length > 0) {
                        unlockedCoupons.forEach((couponItem) => {
                            UnlockedCouponsHTML += `<div class="couponsContentCard">
                                <div class="couponsContentImg">
                                    <h5>₹${couponItem?.amount}</h5>
                                    <p>Voucher</p>
                                </div>
                                <div class="couponsContentText">
                                    <h5>${couponItem?.title}</h5>
                                    <div class="couponCodeContainer"><p>code:</p><h5>${couponItem?.coupon}</h5></div>
                                    <p>created on ${couponItem?.date}</p>
                                </div>
                            </div>`
                        });
                    } else {
                        UnlockedCouponsHTML = `
                        <div class="no-coupons-found">
                            <div><img src="https://media.farziengineer.co/farziwallet/no-coupons.png"/></div>
                            <div><h5>Uh-Oh!</h5></div>
                            <div><p>Looks like you haven't unlocked any coupons</p></div>
                        </div>
                        `
                    }

                    shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .couponsScreenContainer .couponCodes .couponsContent').innerHTML = UnlockedCouponsHTML;

                    const availableCouponsTab = shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .couponsScreenContainer .top-head-tabs #available-coupons-screen');

                    const yourCouponsTab = shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .couponsScreenContainer .top-head-tabs #your-coupons-screen');

                    availableCouponsTab.classList.remove("active-tab");
                    yourCouponsTab.classList.add("active-tab");

                    availableCouponsTab.addEventListener('click', () => {
                        const yourCouponsTab = shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .couponsScreenContainer .top-head-tabs #your-coupons-screen');
                        yourCouponsTab.className = '';
                        availableCouponsTab.className = 'active-tab'
                        showViewAllCouponsScreen();
                    })
                    shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .go-back-header .close').addEventListener('click', () => {
                        loggedIn(false);
                    })


                    const couponTabUnlocked = shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .couponsScreenContainer .couponCodes .tabHead #coupon-tab-unlocked');
                    couponTabUnlocked.addEventListener('click', () => showYourCouponsTab());

                    const couponTabRedeemed = shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .couponsScreenContainer .couponCodes .tabHead #coupon-tab-redeemed');
                    couponTabRedeemed.addEventListener('click', () => {

                        const redeemedCoupons = userCoupon?.data?.redeemed;

                        let redeemedCouponsHTML = '';
                        if (redeemedCoupons?.length > 0) {
                            redeemedCoupons.forEach((couponItem) => {
                                redeemedCouponsHTML += `<div class="couponsContentCard">
                                <div class="couponsContentImg">
                                    <h5>₹${couponItem?.amount}</h5>
                                    <p>Voucher</p>
                                </div>
                                <div class="couponsContentText">
                                    <h5>${couponItem?.title}</h5>
                                    <div class="couponCodeContainer"><p>code:</p><h5>${couponItem?.coupon}</h5></div>
                                    <p>created on ${couponItem?.date}</p>
                                </div>
                            </div>`
                            });
                        } else {
                            redeemedCouponsHTML = `
                            <div class="no-coupons-found">
                                <div><img src="https://earthrhythm-media.farziengineer.co/hosted/image_24-c96b6aaf23b2.png"/></div>
                                <div><h5>Uh-Oh!</h5></div>
                                <div><p>Looks like you don't have any redeemed coupons</p></div>
                            </div>
                            `
                        }

                        shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .couponsScreenContainer .couponCodes .couponsContent').innerHTML = redeemedCouponsHTML;

                        shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .couponsScreenContainer .couponCodes .tabHead .active-coupons-tab').classList.remove("active-coupons-tab");
                        couponTabRedeemed.classList.add("active-coupons-tab")
                    });

                    const couponTabGifted = shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .couponsScreenContainer .couponCodes .tabHead #coupon-tab-gifted');
                    couponTabGifted.addEventListener('click', () => {

                        const giftedCoupons = userCoupon?.data?.gifted;

                        let giftedCouponsHTML = '';
                        if (giftedCoupons?.length > 0) {
                            giftedCoupons.forEach((couponItem) => {
                                giftedCouponsHTML += `<div class="couponsContentCard">
                                <div class="couponsContentImg">
                                    <h5>₹${couponItem?.amount}</h5>
                                    <p>Voucher</p>
                                </div>
                                <div class="couponsContentText">
                                    <h5>${couponItem?.title}</h5>
                                    <div class="couponCodeContainer"><p>code:</p><h5>${couponItem?.coupon}</h5></div>
                                    <p>created on ${couponItem?.date}</p>
                                </div>
                            </div>`
                            });
                        } else {
                            giftedCouponsHTML = `
                            <div class="no-coupons-found">
                                <div><img src="https://media.farziengineer.co/farziwallet/no-coupons.png"/></div>
                                <div><h5>Uh-Oh!</h5></div>
                                <div><p>Looks like you don't have any gifted coupons</p></div>
                            </div>
                            `
                        }


                        shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .couponsScreenContainer .couponCodes .couponsContent').innerHTML = giftedCouponsHTML;

                        shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .couponsScreenContainer .couponCodes .tabHead .active-coupons-tab').classList.remove("active-coupons-tab");
                        couponTabGifted.classList.add("active-coupons-tab")
                    });
                })

                shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .go-back-header .close').addEventListener('click', () => {
                    loggedIn(false);
                })
            })
        })();

        (function exploreWheel() {
            shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .gameArena #gameArenacard-wheelOfFortune .gameArenaBtn').addEventListener('click', async function showSpinWheels() {
                let overLayScreenPointsActivity = injectVariablesToHTML(fullheightoverlaymodal, ".full_height_overlay_modal .content", `<div class="couponsScreenContainer"><h4>Wheel of Fortune</h4>
                ${exploregamescreen}</div>`);

                overLayScreenPointsActivity = injectVariablesToHTML(overLayScreenPointsActivity, ".top-head .top-head-points .points-wrapper", `${walletAmount}`);

                showLoadingScreen(true);

                const spinWheelDataRes = await fetch(`${process.env.WALLET_API_URI}/get-featured-spin-wheels`, {
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

                const spinWheelDataReponse = await spinWheelDataRes.json();
                const spinWheelCardsData = spinWheelDataReponse?.data;

                showLoadingScreen(false);

                let spinWheelCardsHTML = "";
                spinWheelCardsData.forEach((cardItem, index) => {
                    spinWheelCardsHTML += `
                    <div data-spin-wheel-idx="${index}" class="gameArenacard">
                        <img data-spin-wheel-idx="${index}" src="${cardItem?.image}" />
                        <div data-spin-wheel-idx="${index}" class="gameArenaDesc">
                            <p data-spin-wheel-idx="${index}" class="gameArenaDesc-title">${cardItem?.title}</p>
                            <p data-spin-wheel-idx="${index}" class="gameArenaDesc-subtitle">${cardItem?.description}</p>
                            <div data-spin-wheel-idx="${index}" class="gameArenaDescValue"><span class="coins-icon"></span>
                                <p data-spin-wheel-idx="${index}">${cardItem?.amount}</p>
                            </div>
                            <div data-spin-wheel-idx="${index}" class="gameArenaBtn">Spin</div>
                        </div>
                    </div>
                    `
                })

                overLayScreenPointsActivity = injectVariablesToHTML(overLayScreenPointsActivity, ".spinWheels .cardContainer.cardRow", spinWheelCardsHTML);

                shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay').innerHTML = overLayScreenPointsActivity;

                shadowRoot.querySelectorAll('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .spinWheels .gameArenacard').forEach((element) => {
                    element.addEventListener('click', async function openWheelScreen(event, spinWHeelCardIndexArg) {
                        const spinWHeelCardIndex = event?.target?.getAttribute("data-spin-wheel-idx") || spinWHeelCardIndexArg;
                        const selectedSpinWheelCardsData = spinWHeelCardIndex && spinWheelCardsData[spinWHeelCardIndex];
                        const spinWheelAmount = selectedSpinWheelCardsData?.amount;

                        let spinAndWinWheel = injectVariablesToHTML(spinandwinscreen, '.top-head .top-head-points .points-wrapper', `${walletAmount}`);

                        spinAndWinWheel = injectVariablesToHTML(spinAndWinWheel, '.spin-wheel-bottom .unlock-wheel-text', `Unlock for ${spinWheelAmount} OB Coins`);

                        shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .full_height_overlay_modal').innerHTML = spinAndWinWheel;

                        showLoadingScreen(true);

                        const res1 = await fetch('https://d3js.org/d3.v3.min.js');
                        const fileContent1 = await res1.text();
                        var script1 = document.createElement('script');
                        script1.innerHTML = fileContent1;

                        shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .full_height_overlay_modal .content .playArea').appendChild(script1);

                        drawWheel(shadowRoot, Array.from({ length: 6 }, () => ({ label: "", value: 5 })), false);

                        showLoadingScreen(false);

                        shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .playArea .unlock-spin-wheel-btn').addEventListener('click', async () => {
                            showLoadingScreen(true);
                            const spinResponse = await fetch(`${process.env.WALLET_API_URI}/redeem-spin-wheel`, {
                                "method": "POST",
                                "headers": {
                                    "Content-Type": "application/json"
                                },
                                "body": JSON.stringify({
                                    "customer_id": customer_id,
                                    "user_hash": customer_tags,
                                    "couponAmount": spinWheelAmount,
                                    "client_id": client_id

                                })
                            });
                            const spinData = await spinResponse.json();

                            if (spinData?.status !== "success") {
                                showLoadingScreen(false);
                                showAlertPopup(spinData?.error, "error");
                                return;
                            }

                            const unlockedWheel = shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .playArea #fw-chart-spin-wheel svg')
                            unlockedWheel.parentNode.removeChild(unlockedWheel);

                            drawWheel(shadowRoot, Array.from({ length: 6 }, () => ({ label: spinData?.data?.win_message, value: 5 })), true, () => {
                                setTimeout(async function showSpinWheelWinningPopup() {
                                    shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .playArea .spinned-win-modal-container .spin-win-message').innerHTML = spinData?.data?.win_message;

                                    shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .playArea .spinned-win-modal-container').style.height = "100%";

                                    shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .playArea .spinned-win-modal-container .spin-win-play-again button').addEventListener('click', () => {
                                        openWheelScreen(null, spinWHeelCardIndex);
                                    })

                                    shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .playArea .spinned-win-modal-container .spin-win-close button').addEventListener('click', () => {
                                        showSpinWheels();
                                    })
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
                                    const walletData = await response.json()
                                    walletAmount = walletData?.data?.data?.wallet?.wallet?.amount;
                                    if (shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .top-head-points .points-wrapper')) {
                                        shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .top-head-points .points-wrapper').innerHTML = walletAmount;
                                    }
                                }, 1000)

                            });

                            shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .playArea #fw-chart-spin-wheel img').style.display = "none";

                            shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .playArea #fw-chart-spin-wheel svg').style.opacity = 1;

                            shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .playArea .unlock-wheel-text').innerHTML = "Click 'SPIN' to start";

                            shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .playArea .unlock-spin-wheel-btn').style.display = "none";

                            showLoadingScreen(false);
                        })
                        shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .go-back-header .close').addEventListener('click', () => {
                            showSpinWheels();
                        })

                    })
                })

                //Your coupons screen
                const availableCouponsTab = shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .couponsScreenContainer .top-head-tabs #available-coupons-screen');

                const yourCouponsTab = shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .couponsScreenContainer .top-head-tabs #your-coupons-screen');

                availableCouponsTab.addEventListener('click', () => {
                    yourCouponsTab.classList.remove("active-tab");
                    availableCouponsTab.classList.add("active-tab");
                    showSpinWheels();
                })

                yourCouponsTab.addEventListener('click', async function showYourCouponsTab() {
                    let overLayScreenPointsActivityYourCoupons = injectVariablesToHTML(fullheightoverlaymodal, ".full_height_overlay_modal .content", `<div class="couponsScreenContainer"><h4>Coupons</h4>
                ${yourcouponsscreen}</div>`);

                    overLayScreenPointsActivityYourCoupons = injectVariablesToHTML(overLayScreenPointsActivityYourCoupons, ".top-head .top-head-points .points-wrapper", `${walletAmount}`);

                    shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay').innerHTML = overLayScreenPointsActivityYourCoupons;

                    showLoadingScreen(true);

                    const userCouponResponse = await fetch(`${process.env.WALLET_API_URI}/get-user-coupons`, {
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

                    const userCoupon = await userCouponResponse.json();
                    const unlockedCoupons = userCoupon?.data?.unlocked;

                    showLoadingScreen(false);

                    let UnlockedCouponsHTML = '';
                    if (unlockedCoupons?.length > 0) {
                        unlockedCoupons.forEach((couponItem) => {
                            UnlockedCouponsHTML += `<div class="couponsContentCard">
                                <div class="couponsContentImg">
                                    <h5>₹${couponItem?.amount}</h5>
                                    <p>Voucher</p>
                                </div>
                                <div class="couponsContentText">
                                    <h5>${couponItem?.title}</h5>
                                    <div class="couponCodeContainer"><p>code:</p><h5>${couponItem?.coupon}</h5></div>
                                    <p>created on ${couponItem?.date}</p>
                                </div>
                            </div>`
                        });
                    } else {
                        UnlockedCouponsHTML = `
                        <div class="no-coupons-found">
                            <div><img src="https://media.farziengineer.co/farziwallet/no-coupons.png"/></div>
                            <div><h5>Uh-Oh!</h5></div>
                            <div><p>Looks like you haven't unlocked any coupons</p></div>
                        </div>
                        `
                    }

                    shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .couponsScreenContainer .couponCodes .couponsContent').innerHTML = UnlockedCouponsHTML;

                    const availableCouponsTab = shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .couponsScreenContainer .top-head-tabs #available-coupons-screen');

                    const yourCouponsTab = shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .couponsScreenContainer .top-head-tabs #your-coupons-screen');

                    availableCouponsTab.classList.remove("active-tab");
                    yourCouponsTab.classList.add("active-tab");

                    availableCouponsTab.addEventListener('click', () => {
                        const yourCouponsTab = shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .couponsScreenContainer .top-head-tabs #your-coupons-screen');
                        yourCouponsTab.className = '';
                        availableCouponsTab.className = 'active-tab'
                        showSpinWheels();
                    })
                    shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .go-back-header .close').addEventListener('click', () => {
                        loggedIn(false);
                    })


                    const couponTabUnlocked = shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .couponsScreenContainer .couponCodes .tabHead #coupon-tab-unlocked');
                    couponTabUnlocked.addEventListener('click', () => showYourCouponsTab());

                    const couponTabRedeemed = shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .couponsScreenContainer .couponCodes .tabHead #coupon-tab-redeemed');
                    couponTabRedeemed.addEventListener('click', () => {

                        const redeemedCoupons = userCoupon?.data?.redeemed;

                        let redeemedCouponsHTML = '';
                        if (redeemedCoupons?.length > 0) {
                            redeemedCoupons.forEach((couponItem) => {
                                redeemedCouponsHTML += `<div class="couponsContentCard">
                                <div class="couponsContentImg">
                                    <h5>₹${couponItem?.amount}</h5>
                                    <p>Voucher</p>
                                </div>
                                <div class="couponsContentText">
                                    <h5>${couponItem?.title}</h5>
                                    <div class="couponCodeContainer"><p>code:</p><h5>${couponItem?.coupon}</h5></div>
                                    <p>created on ${couponItem?.date}</p>
                                </div>
                            </div>`
                            });
                        } else {
                            redeemedCouponsHTML = `
                            <div class="no-coupons-found">
                                <div><img src="https://media.farziengineer.co/farziwallet/no-coupons.png"/></div>
                                <div><h5>Uh-Oh!</h5></div>
                                <div><p>Looks like you don't have any redeemed coupons</p></div>
                            </div>
                            `
                        }

                        shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .couponsScreenContainer .couponCodes .couponsContent').innerHTML = redeemedCouponsHTML;

                        shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .couponsScreenContainer .couponCodes .tabHead .active-coupons-tab').classList.remove("active-coupons-tab");
                        couponTabRedeemed.classList.add("active-coupons-tab")
                    });

                    const couponTabGifted = shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .couponsScreenContainer .couponCodes .tabHead #coupon-tab-gifted');
                    couponTabGifted.addEventListener('click', () => {

                        const giftedCoupons = userCoupon?.data?.gifted;

                        let giftedCouponsHTML = '';
                        if (giftedCoupons?.length > 0) {
                            giftedCoupons.forEach((couponItem) => {
                                giftedCouponsHTML += `<div class="couponsContentCard">
                                <div class="couponsContentImg">
                                    <h5>₹${couponItem?.amount}</h5>
                                    <p>Voucher</p>
                                </div>
                                <div class="couponsContentText">
                                    <h5>${couponItem?.title}</h5>
                                    <div class="couponCodeContainer"><p>code:</p><h5>${couponItem?.coupon}</h5></div>
                                    <p>created on ${couponItem?.date}</p>
                                </div>
                            </div>`
                            });
                        } else {
                            giftedCouponsHTML = `
                            <div class="no-coupons-found">
                                <div><img src="https://media.farziengineer.co/farziwallet/no-coupons.png"/></div>
                                <div><h5>Uh-Oh!</h5></div>
                                <div><p>Looks like you don't have any gifted coupons</p></div>
                            </div>
                            `
                        }


                        shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .couponsScreenContainer .couponCodes .couponsContent').innerHTML = giftedCouponsHTML;

                        shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .couponsScreenContainer .couponCodes .tabHead .active-coupons-tab').classList.remove("active-coupons-tab");
                        couponTabGifted.classList.add("active-coupons-tab")
                    });
                })


                shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .go-back-header .close').addEventListener('click', () => {
                    loggedIn(false);
                })
            })
        })();

        (function exploreScratchCards() {
            shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .gameArena #gameArenacard-scratchCard .gameArenaBtn').addEventListener('click', async function showScratchCards() {
                let overLayScreenPointsActivity = injectVariablesToHTML(fullheightoverlaymodal, ".full_height_overlay_modal .content", `<div class="couponsScreenContainer"><h4>Scratch Card</h4>
                ${exploregamescreen2}</div>`);

                overLayScreenPointsActivity = injectVariablesToHTML(overLayScreenPointsActivity, ".top-head .top-head-points .points-wrapper", `${walletAmount}`);

                showLoadingScreen(true);

                const scratchCardDataRes = await fetch(`${process.env.WALLET_API_URI}/get-featured-scratch-cards`, {
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

                const scratchCardDataResponse = await scratchCardDataRes.json();
                const scratchCardData = scratchCardDataResponse?.data;

                showLoadingScreen(false);

                let scratchCardDataHTML = "";
                scratchCardData.forEach((cardItem, index) => {
                    scratchCardDataHTML += `
                    <div data-scratch-card-idx="${index}" class="gameArenacard">
                        <img data-scratch-card-idx="${index}" src="${cardItem?.image}" />
                        <div data-scratch-card-idx="${index}" class="gameArenaDesc">
                            <p data-scratch-card-idx="${index}" class="gameArenaDesc-title">${cardItem?.title}</p>
                            <p data-scratch-card-idx="${index}" class="gameArenaDesc-subtitle">${cardItem?.description}</p>
                            <div data-scratch-card-idx="${index}" class="gameArenaDescValue"><span class="coins-icon"></span>
                                <p data-scratch-card-idx="${index}">${cardItem?.amount}</p>
                            </div>
                            <div data-scratch-card-idx="${index}" class="gameArenaBtn">Scratch</div>
                        </div>
                    </div>
                    `
                })

                overLayScreenPointsActivity = injectVariablesToHTML(overLayScreenPointsActivity, ".spinWheels .cardContainer.cardRow", scratchCardDataHTML);

                shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay').innerHTML = overLayScreenPointsActivity;

                shadowRoot.querySelectorAll('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .spinWheels .gameArenacard').forEach((element) => {
                    element.addEventListener('click', async function openScratchCardScreen(event, scratchCardIndexArg) {
                        const scratchCardIndex = event?.target?.getAttribute("data-scratch-card-idx") || scratchCardIndexArg;
                        const selectedscratchCardData = scratchCardIndex && scratchCardData[scratchCardIndex];
                        const scratchCardAmount = selectedscratchCardData?.amount;

                        let scratchCardScreenHTML = injectVariablesToHTML(scratchcardscreen, '.top-head .top-head-points .points-wrapper', `${walletAmount}`);

                        scratchCardScreenHTML = injectVariablesToHTML(scratchCardScreenHTML, '.scratch-card-bottom .unlock-card-text', `Unlock for ${scratchCardAmount} OB Coins`);

                        shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .full_height_overlay_modal').innerHTML = scratchCardScreenHTML;

                        (function drawLockedScratchCard() {
                            let canvas = shadowRoot.getElementById("scratch-card-element");
                            let context = canvas.getContext("2d");

                            const init = () => {
                                let gradientColor = context.createLinearGradient(0, 0, 135, 135);
                                gradientColor.addColorStop(0, "#AEE7FF");
                                gradientColor.addColorStop(1, "#AEE7FF");
                                context.fillStyle = gradientColor;
                                context.fillRect(0, 0, 300, 300);

                                // Adding dots for seats
                                context.fillStyle = "#94DDFF"; // Set the dot color

                                const seatSize = 5; // Size of each seat
                                const gap = 40; // Gap between seats

                                const rows = 6; // Number of rows
                                const seatsPerRow = 6; // Number of seats per row

                                const startX = 30; // Starting X position
                                const startY = 30; // Starting Y position

                                for (let row = 0; row < rows; row++) {
                                    for (let seat = 0; seat < seatsPerRow; seat++) {
                                        const x = startX + seat * (seatSize + gap);
                                        const y = startY + row * (seatSize + gap);
                                        context.beginPath();
                                        context.arc(x, y, seatSize, 0, 2 * Math.PI);
                                        context.fill();
                                    }
                                }
                            };

                            window.onload = init();
                        })();


                        shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .playArea .unlock-scratch-card-btn').addEventListener('click', async () => {
                            showLoadingScreen(true);
                            const scratchCardResponse = await fetch(`${process.env.WALLET_API_URI}/redeem-scratch-card`, {
                                "method": "POST",
                                "headers": {
                                    "Content-Type": "application/json"
                                },
                                "body": JSON.stringify({
                                    "customer_id": customer_id,
                                    "user_hash": customer_tags,
                                    "couponAmount": scratchCardAmount,
                                    "client_id": client_id
                                })
                            });
                            const scratchCardData = await scratchCardResponse.json();

                            if (scratchCardData?.status !== "success") {
                                showLoadingScreen(false);
                                showAlertPopup(scratchCardData?.error, "error");
                                return;
                            }

                            shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .playArea #fw-chart-scratch-card .scratch-card-base h4').innerHTML = scratchCardData?.data?.win_message;

                            showLoadingScreen(false);

                            (function drawUnlockedScratchCard() {
                                let canvas = shadowRoot.getElementById("scratch-card-element");
                                let context = canvas.getContext("2d");

                                const init = () => {
                                    let gradientColor = context.createLinearGradient(0, 0, 135, 135);
                                    gradientColor.addColorStop(0, "#AEE7FF");
                                    gradientColor.addColorStop(1, "#AEE7FF");
                                    context.fillStyle = gradientColor;
                                    context.fillRect(0, 0, 300, 300);

                                    // Adding dots for seats
                                    context.fillStyle = "#94DDFF"; // Set the dot color

                                    const seatSize = 5; // Size of each seat
                                    const gap = 40; // Gap between seats

                                    const rows = 6; // Number of rows
                                    const seatsPerRow = 6; // Number of seats per row

                                    const startX = 30; // Starting X position
                                    const startY = 30; // Starting Y position

                                    for (let row = 0; row < rows; row++) {
                                        for (let seat = 0; seat < seatsPerRow; seat++) {
                                            const x = startX + seat * (seatSize + gap);
                                            const y = startY + row * (seatSize + gap);
                                            context.beginPath();
                                            context.arc(x, y, seatSize, 0, 2 * Math.PI);
                                            context.fill();
                                        }
                                    }
                                };

                                //initially mouse X and mouse Y positions are 0
                                let mouseX = 0;
                                let mouseY = 0;
                                let isDragged = false;

                                //Events for touch and mouse
                                let events = {
                                    mouse: {
                                        down: "mousedown",
                                        move: "mousemove",
                                        up: "mouseup",
                                    },
                                    touch: {
                                        down: "touchstart",
                                        move: "touchmove",
                                        up: "touchend",
                                    },
                                };

                                let deviceType = "";

                                //Detech touch device
                                const isTouchDevice = () => {
                                    try {
                                        //We try to create TouchEvent. It would fail for desktops and throw error.
                                        document.createEvent("TouchEvent");
                                        deviceType = "touch";
                                        return true;
                                    } catch (e) {
                                        deviceType = "mouse";
                                        return false;
                                    }
                                };

                                //Get left and top of canvas
                                let rectLeft = canvas.getBoundingClientRect().left;
                                let rectTop = canvas.getBoundingClientRect().top;

                                //Exact x and y position of mouse/touch
                                const getXY = (e) => {
                                    mouseX = (!isTouchDevice() ? e.pageX : e.touches[0].pageX) - rectLeft;
                                    mouseY = (!isTouchDevice() ? e.pageY : e.touches[0].pageY) - rectTop;
                                };

                                isTouchDevice();
                                //Start Scratch
                                canvas.addEventListener(events[deviceType].down, (event) => {
                                    isDragged = true;
                                    //Get x and y position
                                    getXY(event);
                                    scratch(mouseX, mouseY);
                                });

                                //mousemove/touchmove
                                canvas.addEventListener(events[deviceType].move, (event) => {
                                    if (!isTouchDevice()) {
                                        event.preventDefault();
                                    }
                                    if (isDragged) {
                                        getXY(event);
                                        scratch(mouseX, mouseY);
                                    }
                                });

                                //stop drawing
                                canvas.addEventListener(events[deviceType].up, () => {
                                    isDragged = false;
                                });

                                //If mouse leaves the square
                                canvas.addEventListener("mouseleave", () => {
                                    isDragged = false;
                                });

                                let scratchedPixels = 0;
                                const threshold = 460;
                                let cardScratchable = true;
                                const scratch = async (x, y) => {
                                    //destination-out draws new shapes behind the existing canvas content
                                    context.globalCompositeOperation = "destination-out";
                                    context.beginPath();
                                    //arc makes circle - x,y,radius,start angle,end angle
                                    context.arc(x, y, 12, 0, 2 * Math.PI);
                                    context.fill();

                                    const centerX = canvas.width / 2;
                                    const centerY = canvas.height / 2;
                                    const distanceFromCenter = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                                    const centerAreaRadius = 200; // Radius of the center area

                                    if (distanceFromCenter <= centerAreaRadius) {
                                        // Increment the scratchedCenterAreaPixels count
                                        scratchedPixels++;
                                    }
                                    if (scratchedPixels >= threshold && cardScratchable) {
                                        // card scratch completed
                                        cardScratchable = false;

                                        shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .playArea .scratched-win-modal-container .scratch-win-message').innerHTML = scratchCardData?.data?.win_message;

                                        shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .playArea .scratched-win-modal-container').style.height = "100%";

                                        shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .playArea .scratched-win-modal-container .scratch-win-play-again button').addEventListener('click', () => {
                                            openScratchCardScreen(null, scratchCardIndex);
                                        })

                                        shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .playArea .scratched-win-modal-container .scratch-win-close button').addEventListener('click', () => {
                                            showScratchCards();
                                        })
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
                                        const walletData = await response.json()
                                        walletAmount = walletData?.data?.data?.wallet?.wallet?.amount;
                                        if (shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .top-head-points .points-wrapper')) {
                                            shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .top-head-points .points-wrapper').innerHTML = walletAmount;
                                        }
                                    }

                                };

                                window.onload = init();
                            })();

                            shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .playArea #fw-chart-scratch-card img').style.display = "none";

                            shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .playArea #fw-chart-scratch-card > div').style.opacity = 1;

                            shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .playArea .unlock-card-text').innerHTML = "Click and drag your cursor across the card";

                            shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .playArea .unlock-scratch-card-btn').style.display = "none";
                        })

                        shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .go-back-header .close').addEventListener('click', () => {
                            showScratchCards();
                        })


                    })
                })

                //Your coupons screen
                const availableCouponsTab = shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .couponsScreenContainer .top-head-tabs #available-coupons-screen');

                const yourCouponsTab = shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .couponsScreenContainer .top-head-tabs #your-coupons-screen');

                availableCouponsTab.addEventListener('click', () => {
                    yourCouponsTab.classList.remove("active-tab");
                    availableCouponsTab.classList.add("active-tab");
                    showSpinWheels();
                })

                yourCouponsTab.addEventListener('click', async function showYourCouponsTab() {
                    let overLayScreenPointsActivityYourCoupons = injectVariablesToHTML(fullheightoverlaymodal, ".full_height_overlay_modal .content", `<div class="couponsScreenContainer"><h4>Coupons</h4>
                ${yourcouponsscreen}</div>`);

                    overLayScreenPointsActivityYourCoupons = injectVariablesToHTML(overLayScreenPointsActivityYourCoupons, ".top-head .top-head-points .points-wrapper", `${walletAmount}`);

                    shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay').innerHTML = overLayScreenPointsActivityYourCoupons;

                    showLoadingScreen(true);

                    const userCouponResponse = await fetch(`${process.env.WALLET_API_URI}/get-user-coupons`, {
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

                    const userCoupon = await userCouponResponse.json();
                    const unlockedCoupons = userCoupon?.data?.unlocked;

                    showLoadingScreen(false);

                    let UnlockedCouponsHTML = '';
                    if (unlockedCoupons?.length > 0) {
                        unlockedCoupons.forEach((couponItem) => {
                            UnlockedCouponsHTML += `<div class="couponsContentCard">
                                <div class="couponsContentImg">
                                    <h5>₹${couponItem?.amount}</h5>
                                    <p>Voucher</p>
                                </div>
                                <div class="couponsContentText">
                                    <h5>${couponItem?.title}</h5>
                                    <div class="couponCodeContainer"><p>code:</p><h5>${couponItem?.coupon}</h5></div>
                                    <p>created on ${couponItem?.date}</p>
                                </div>
                            </div>`
                        });
                    } else {
                        UnlockedCouponsHTML = `
                        <div class="no-coupons-found">
                            <div><img src="https://media.farziengineer.co/farziwallet/no-coupons.png"/></div>
                            <div><h5>Uh-Oh!</h5></div>
                            <div><p>Looks like you haven't unlocked any coupons</p></div>
                        </div>
                        `
                    }

                    shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .couponsScreenContainer .couponCodes .couponsContent').innerHTML = UnlockedCouponsHTML;

                    const availableCouponsTab = shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .couponsScreenContainer .top-head-tabs #available-coupons-screen');

                    const yourCouponsTab = shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .couponsScreenContainer .top-head-tabs #your-coupons-screen');

                    availableCouponsTab.classList.remove("active-tab");
                    yourCouponsTab.classList.add("active-tab");

                    availableCouponsTab.addEventListener('click', () => {
                        const yourCouponsTab = shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .couponsScreenContainer .top-head-tabs #your-coupons-screen');
                        yourCouponsTab.className = '';
                        availableCouponsTab.className = 'active-tab'
                        showScratchCards();
                    })
                    shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .go-back-header .close').addEventListener('click', () => {
                        loggedIn(false);
                    })


                    const couponTabUnlocked = shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .couponsScreenContainer .couponCodes .tabHead #coupon-tab-unlocked');
                    couponTabUnlocked.addEventListener('click', () => showYourCouponsTab());

                    const couponTabRedeemed = shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .couponsScreenContainer .couponCodes .tabHead #coupon-tab-redeemed');
                    couponTabRedeemed.addEventListener('click', () => {

                        const redeemedCoupons = userCoupon?.data?.redeemed;

                        let redeemedCouponsHTML = '';
                        if (redeemedCoupons?.length > 0) {
                            redeemedCoupons.forEach((couponItem) => {
                                redeemedCouponsHTML += `<div class="couponsContentCard">
                                <div class="couponsContentImg">
                                    <h5>₹${couponItem?.amount}</h5>
                                    <p>Voucher</p>
                                </div>
                                <div class="couponsContentText">
                                    <h5>${couponItem?.title}</h5>
                                    <div class="couponCodeContainer"><p>code:</p><h5>${couponItem?.coupon}</h5></div>
                                    <p>created on ${couponItem?.date}</p>
                                </div>
                            </div>`
                            });
                        } else {
                            redeemedCouponsHTML = `
                            <div class="no-coupons-found">
                                <div><img src="https://media.farziengineer.co/farziwallet/no-coupons.png"/></div>
                                <div><h5>Uh-Oh!</h5></div>
                                <div><p>Looks like you don't have any redeemed coupons</p></div>
                            </div>
                            `
                        }

                        shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .couponsScreenContainer .couponCodes .couponsContent').innerHTML = redeemedCouponsHTML;

                        shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .couponsScreenContainer .couponCodes .tabHead .active-coupons-tab').classList.remove("active-coupons-tab");
                        couponTabRedeemed.classList.add("active-coupons-tab")
                    });

                    const couponTabGifted = shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .couponsScreenContainer .couponCodes .tabHead #coupon-tab-gifted');
                    couponTabGifted.addEventListener('click', () => {

                        const giftedCoupons = userCoupon?.data?.gifted;

                        let giftedCouponsHTML = '';
                        if (giftedCoupons?.length > 0) {
                            giftedCoupons.forEach((couponItem) => {
                                giftedCouponsHTML += `<div class="couponsContentCard">
                                <div class="couponsContentImg">
                                    <h5>₹${couponItem?.amount}</h5>
                                    <p>Voucher</p>
                                </div>
                                <div class="couponsContentText">
                                    <h5>${couponItem?.title}</h5>
                                    <div class="couponCodeContainer"><p>code:</p><h5>${couponItem?.coupon}</h5></div>
                                    <p>created on ${couponItem?.date}</p>
                                </div>
                            </div>`
                            });
                        } else {
                            giftedCouponsHTML = `
                            <div class="no-coupons-found">
                                <div><img src="https://media.farziengineer.co/farziwallet/no-coupons.png"/></div>
                                <div><h5>Uh-Oh!</h5></div>
                                <div><p>Looks like you don't have any gifted coupons</p></div>
                            </div>
                            `
                        }


                        shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .couponsScreenContainer .couponCodes .couponsContent').innerHTML = giftedCouponsHTML;

                        shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .couponsScreenContainer .couponCodes .tabHead .active-coupons-tab').classList.remove("active-coupons-tab");
                        couponTabGifted.classList.add("active-coupons-tab")
                    });
                })


                shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .go-back-header .close').addEventListener('click', () => {
                    loggedIn(false);
                })
            })
        })();

        (function exploreLottoQuiz() {
            shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .gameArena #gameArenacard-lottery .gameArenaBtn').addEventListener('click', async function showLottoQuiz() {
                let overLayScreenLottoQuiz = injectVariablesToHTML(fullheightoverlaymodal, ".full_height_overlay_modal .content", `<div class="couponsScreenContainer"><h4>Lotto Quiz</h4>
                ${exploregamescreen3}</div>`);

                overLayScreenLottoQuiz = injectVariablesToHTML(overLayScreenLottoQuiz, ".top-head .top-head-points .points-wrapper", `${walletAmount}`);


                const lottoQuizCardData = [{
                    title: "Lotto Quiz",
                    description: "Win upto 30 OB Coins",
                    image: "https://media.farziengineer.co/farziwallet/lotto.png",
                    amount: 10
                }];

                let lottoQuizCardDataHTML = "";
                lottoQuizCardData.forEach((cardItem, index) => {
                    lottoQuizCardDataHTML += `
                    <div data-scratch-card-idx="${index}" class="gameArenacard">
                        <img data-scratch-card-idx="${index}" src="${cardItem?.image}" />
                        <div data-scratch-card-idx="${index}" class="gameArenaDesc">
                            <p data-scratch-card-idx="${index}" class="gameArenaDesc-title">${cardItem?.title}</p>
                            <p data-scratch-card-idx="${index}" class="gameArenaDesc-subtitle">${cardItem?.description}</p>
                            <div data-scratch-card-idx="${index}" class="gameArenaDescValue"><span class="coins-icon"></span>
                                <p data-scratch-card-idx="${index}">${cardItem?.amount}</p>
                            </div>
                            <div data-scratch-card-idx="${index}" class="gameArenaBtn" style="cursor: not-allowed;">Coming soon</div>
                        </div>
                    </div>
                    `
                })

                overLayScreenLottoQuiz = injectVariablesToHTML(overLayScreenLottoQuiz, ".spinWheels .cardContainer.cardRow", lottoQuizCardDataHTML);

                shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay').innerHTML = overLayScreenLottoQuiz;


                //Your coupons screen
                const availableCouponsTab = shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .couponsScreenContainer .top-head-tabs #available-coupons-screen');

                const yourCouponsTab = shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .couponsScreenContainer .top-head-tabs #your-coupons-screen');

                availableCouponsTab.addEventListener('click', () => {
                    yourCouponsTab.classList.remove("active-tab");
                    availableCouponsTab.classList.add("active-tab");
                    showLottoQuiz();
                })

                yourCouponsTab.addEventListener('click', async function showYourCouponsTab() {
                    let overLayScreenPointsActivityYourCoupons = injectVariablesToHTML(fullheightoverlaymodal, ".full_height_overlay_modal .content", `<div class="couponsScreenContainer"><h4>Coupons</h4>
                ${yourcouponsscreen}</div>`);

                    overLayScreenPointsActivityYourCoupons = injectVariablesToHTML(overLayScreenPointsActivityYourCoupons, ".top-head .top-head-points .points-wrapper", `${walletAmount}`);

                    shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay').innerHTML = overLayScreenPointsActivityYourCoupons;

                    showLoadingScreen(true);

                    const userCouponResponse = await fetch(`${process.env.WALLET_API_URI}/get-user-coupons`, {
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

                    const userCoupon = await userCouponResponse.json();
                    const unlockedCoupons = userCoupon?.data?.unlocked;

                    showLoadingScreen(false);

                    let UnlockedCouponsHTML = '';
                    if (unlockedCoupons?.length > 0) {
                        unlockedCoupons.forEach((couponItem) => {
                            UnlockedCouponsHTML += `<div class="couponsContentCard">
                                <div class="couponsContentImg">
                                    <h5>₹${couponItem?.amount}</h5>
                                    <p>Voucher</p>
                                </div>
                                <div class="couponsContentText">
                                    <h5>${couponItem?.title}</h5>
                                    <div class="couponCodeContainer"><p>code:</p><h5>${couponItem?.coupon}</h5></div>
                                    <p>created on ${couponItem?.date}</p>
                                </div>
                            </div>`
                        });
                    } else {
                        UnlockedCouponsHTML = `
                        <div class="no-coupons-found">
                            <div><img src=""/></div>
                            <div><h5>Uh-Oh!</h5></div>
                            <div><p>Looks like you haven't unlocked any coupons</p></div>
                        </div>
                        `
                    }

                    shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .couponsScreenContainer .couponCodes .couponsContent').innerHTML = UnlockedCouponsHTML;

                    const availableCouponsTab = shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .couponsScreenContainer .top-head-tabs #available-coupons-screen');

                    const yourCouponsTab = shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .couponsScreenContainer .top-head-tabs #your-coupons-screen');

                    availableCouponsTab.classList.remove("active-tab");
                    yourCouponsTab.classList.add("active-tab");

                    availableCouponsTab.addEventListener('click', () => {
                        const yourCouponsTab = shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .couponsScreenContainer .top-head-tabs #your-coupons-screen');
                        yourCouponsTab.className = '';
                        availableCouponsTab.className = 'active-tab'
                        showLottoQuiz();
                    })
                    shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .go-back-header .close').addEventListener('click', () => {
                        loggedIn(false);
                    })


                    const couponTabUnlocked = shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .couponsScreenContainer .couponCodes .tabHead #coupon-tab-unlocked');
                    couponTabUnlocked.addEventListener('click', () => showYourCouponsTab());

                    const couponTabRedeemed = shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .couponsScreenContainer .couponCodes .tabHead #coupon-tab-redeemed');
                    couponTabRedeemed.addEventListener('click', () => {

                        const redeemedCoupons = userCoupon?.data?.redeemed;

                        let redeemedCouponsHTML = '';
                        if (redeemedCoupons?.length > 0) {
                            redeemedCoupons.forEach((couponItem) => {
                                redeemedCouponsHTML += `<div class="couponsContentCard">
                                <div class="couponsContentImg">
                                    <h5>₹${couponItem?.amount}</h5>
                                    <p>Voucher</p>
                                </div>
                                <div class="couponsContentText">
                                    <h5>${couponItem?.title}</h5>
                                    <div class="couponCodeContainer"><p>code:</p><h5>${couponItem?.coupon}</h5></div>
                                    <p>created on ${couponItem?.date}</p>
                                </div>
                            </div>`
                            });
                        } else {
                            redeemedCouponsHTML = `
                            <div class="no-coupons-found">
                                <div><img src="https://media.farziengineer.co/farziwallet/no-coupons.png"/></div>
                                <div><h5>Uh-Oh!</h5></div>
                                <div><p>Looks like you don't have any redeemed coupons</p></div>
                            </div>
                            `
                        }

                        shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .couponsScreenContainer .couponCodes .couponsContent').innerHTML = redeemedCouponsHTML;

                        shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .couponsScreenContainer .couponCodes .tabHead .active-coupons-tab').classList.remove("active-coupons-tab");
                        couponTabRedeemed.classList.add("active-coupons-tab")
                    });

                    const couponTabGifted = shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .couponsScreenContainer .couponCodes .tabHead #coupon-tab-gifted');
                    couponTabGifted.addEventListener('click', () => {

                        const giftedCoupons = userCoupon?.data?.gifted;

                        let giftedCouponsHTML = '';
                        if (giftedCoupons?.length > 0) {
                            giftedCoupons.forEach((couponItem) => {
                                giftedCouponsHTML += `<div class="couponsContentCard">
                                <div class="couponsContentImg">
                                    <h5>₹${couponItem?.amount}</h5>
                                    <p>Voucher</p>
                                </div>
                                <div class="couponsContentText">
                                    <h5>${couponItem?.title}</h5>
                                    <div class="couponCodeContainer"><p>code:</p><h5>${couponItem?.coupon}</h5></div>
                                    <p>created on ${couponItem?.date}</p>
                                </div>
                            </div>`
                            });
                        } else {
                            giftedCouponsHTML = `
                            <div class="no-coupons-found">
                                <div><img src="https://media.farziengineer.co/farziwallet/no-coupons.png"/></div>
                                <div><h5>Uh-Oh!</h5></div>
                                <div><p>Looks like you don't have any gifted coupons</p></div>
                            </div>
                            `
                        }


                        shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .couponsScreenContainer .couponCodes .couponsContent').innerHTML = giftedCouponsHTML;

                        shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .couponsScreenContainer .couponCodes .tabHead .active-coupons-tab').classList.remove("active-coupons-tab");
                        couponTabGifted.classList.add("active-coupons-tab")
                    });
                })


                shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .go-back-header .close').addEventListener('click', () => {
                    loggedIn(false);
                })
            })
        })();

        (function inviteFriends() {
            shadowRoot.querySelector('.fw_points__overlay .content .invite-friends-wrapper .invite-friends-button button').addEventListener('click', async () => {

                let overLayScreenUnlockCode = injectVariablesToHTML(overlaymodal, ".content", inviteandearnpopup)

                const overlay = shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .overlay_modal');

                overlay.innerHTML = overLayScreenUnlockCode;

                (function openOverlay() {
                    overlay.style.height = "84%";
                    const scrolled = shadowRoot.querySelector('.fw_points__overlay.show_overlay').scrollTop;
                    overlay.style.bottom = `-${scrolled}px`;
                    const backDrop = document.createElement('div');
                    backDrop.innerHTML = `<div class="overlay_modal_backdrop"></div>`;
                    shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay').appendChild(backDrop);

                    shadowRoot.querySelector('.fw_points__overlay.show_overlay').style.overflowY = "hidden";
                })();

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
                //const referralCode = referralCodeData?.data?.referral_code;
                const referralLink = `${window.location.origin}${referralCodeData?.data?.path}`

                shadowRoot.querySelector('.fw_points__overlay .overlay_modal .invite-and-earn-popup .revealed-code p').innerHTML = referralLink;

                const socialContainerHTML = `
                <a
                    href="sms://18005555555/?body=Click on the referral link below and get rewarded with 100 OB Coins. ${referralLink}"
                    target="_blank">
                    <div class="socials-refer-icon">
                        <img src="https://media.farziengineer.co/farziwallet/sms.png" />
                    </div>
                </a>
        
                <a
                    href="https://www.facebook.com/sharer/sharer.php/?u=${encodeURI(referralLink)}" target="_blank">
                    <div class="socials-refer-icon">
                        <img src="https://media.farziengineer.co/farziwallet/facebook-icon.png" />
                    </div>
                </a>
        
                <a
                    href="https://api.whatsapp.com/send?text=Click on the referral link below and get rewarded with 100 OB Coins. ${referralLink}" target="_blank">
                    <div class="socials-refer-icon">
                        <img src="https://media.farziengineer.co/farziwallet/whatsapp-icon.png" />
                    </div>
                </a>
        
                <a
                    href="sms://18005555555/?body=Click on the referral link below and get rewarded with 100 OB Coins. ${referralLink}" target="_blank">
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

                shadowRoot.querySelector('.fw_points__overlay .overlay_modal .go-back-header .go-back-header-heading').addEventListener('click', function () {

                    (function closeOverlay() {
                        overlay.style.height = "0%";
                        overlay.style.bottom = "-120%";
                        const backDrop = shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .overlay_modal_backdrop');
                        backDrop.parentNode.removeChild(backDrop);
                        overlay.innerHTML = '';
                        shadowRoot.querySelector('.fw_points__overlay.show_overlay').style.overflowY = "scroll";
                    })();

                });
            });
        })();
    } else if (client_id) {
        if (fetchThemeDetails) {
            await setTheme({ client_id });
        }

        const couponDataRes = await fetch(`${process.env.WALLET_API_URI}/get-featured-coupons`, {
            "method": "POST",
            "headers": {
                "Content-Type": "application/json"
            },
            "body": JSON.stringify({
                "client_id": client_id
            })
        });

        const couponDataReponse = await couponDataRes.json();
        const couponData = couponDataReponse?.data;


        let loggedInScreenHTML = injectVariablesToHTML(loggedinscreen, ".pointsBox .walletAmount", "0");
        let couponCardHTML = '';
        couponData.forEach((couponItem, index) => {
            couponCardHTML += `
            <div class="card" data-coupon-idx="${index}">
                <img data-coupon-idx="${index}"
                    src="${couponItem?.image}" />
                <div data-coupon-idx="${index}" class="couponDesc">
                    <p data-coupon-idx="${index}" class="couponDesc-text">${couponItem?.title}</p>
                    <div data-coupon-idx="${index}" class="couponValue"><span class="coins-icon"></span>
                        <p>${couponItem?.amount}</p>
                    </div>
                    <div data-coupon-idx="${index}" class="floating-label">${couponItem?.label}</div>
                </div>
            </div>
            `
        });
        loggedInScreenHTML = injectVariablesToHTML(loggedInScreenHTML, ".couponCodes .cardContainer.cardRow", couponCardHTML);

        const cardContainer = shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay');
        cardContainer.innerHTML = loggedInScreenHTML;

        shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .content .points .dropDown').innerHTML = `
        <div class="dropDown__content">
            <div>
                <p class="">Login to access points</p>
            </div>
        </div>
        <div class="pointsBox">
            <p class="walletAmount">Login</p>
        </div>`;
        shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .content .points .dropDown .pointsBox .walletAmount').style.padding = "0px 8px";

        shadowRoot.querySelector('.fw_points__overlay.show_overlay .header #header-close')?.addEventListener('click', () => {
            const cardContainer = shadowRoot.getElementById('card-container');

            if (cardContainer.style.display === 'none') {
                cardContainer.style.display = 'block';
            } else {
                cardContainer.style.display = 'none';
            }
        })

        shadowRoot.querySelector('.fw_points__overlay.show_overlay .content').addEventListener('click', function openSignInPopup() {
            shadowRoot.querySelector('.fw_points__overlay.show_overlay .content').removeEventListener('click', openSignInPopup);
            location.href = "/account/login";
        })
    }
}

