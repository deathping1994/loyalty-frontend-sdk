import signupscreen from "./components/gifting-coupons-snippet/signup-screen.html"
import fullheightoverlaymodal from "./components/gifting-coupons-snippet/full-height-overlay-modal.html"
import yourcouponsscreen from "./components/your-coupons-screen.html"
import couponsscreen from "./components/gifting-coupons-snippet/coupons-screen.html"
import overlaymodal from "./components/gifting-coupons-snippet/overlay-modal.html"
import unlockcodescreen from "./components/gifting-coupons-snippet/unlock-code-screen.html"
import customdiscountcodescreen from "./components/gifting-coupons-snippet/custom-discount-code-screen.html";
import loadingscreen from "./components/loading-screen.html"
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
document.querySelector('#fc-wallet-gifting-coupons-snippet-19212').innerHTML = '';
document.querySelector('#fc-wallet-gifting-coupons-snippet-19212').appendChild(container);


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

    const mainScript = document.querySelector('#fc-wallet-19212');
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
                        overLayScreenUnlockCode = injectVariablesToHTML(overLayScreenUnlockCode, ".unlock-text", `Unlock for ${couponAmount} ${window.fc_loyalty_vars.coin_name || ''} Coins`)

                        const overlay = shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .overlay_modal');

                        overlay.innerHTML = overLayScreenUnlockCode;

                        (function openOverlay() {
                            if (window.innerHeight > 575 && window.innerHeight < 666) {
                                overlay.style.height = "70%"
                            } else if (window.innerHeight < 575 && window.innerHeight > 500) {
                                overlay.style.height = "80%"
                            } else if (window.innerHeight < 500) {
                                overlay.style.height = "90%"
                            } else {
                                overlay.style.height = "70%"
                            }
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
                                walletAmount = walletData?.data?.data?.wallet?.wallet?.amount || 0;
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

            (async function showViewAllCouponsScreen() {
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

                overLayScreenPointsActivity = injectVariablesToHTML(overLayScreenPointsActivity, ".redeemCustomCoins .cardContainer .rowHead p", `Redeem ${window.fc_loyalty_vars.coin_name || ''} Coins`);

                overLayScreenPointsActivity = injectVariablesToHTML(overLayScreenPointsActivity, ".redeemCustomCoins .cardContainer.cardRow .redeemCustomCoinsCard .redeemCustomCoinsText h5", `100 ${window.fc_loyalty_vars.coin_name || ''} Coins = ₹100`);

                overLayScreenPointsActivity = injectVariablesToHTML(overLayScreenPointsActivity, ".redeemCustomCoins .cardContainer.cardRow .redeemCustomCoinsCard .redeemCustomCoinsText p", `Use ${window.fc_loyalty_vars.coin_name || ''} Coins to create a custom discount coupon`);

                overLayScreenPointsActivity = injectVariablesToHTML(overLayScreenPointsActivity, ".couponCodes .cardContainer.cardRow", couponCardHTML);

                shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay').innerHTML = overLayScreenPointsActivity;

                redeemCodeOnClick();

                shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .couponsScreenContainer .cardContainer .redeemCustomCoinsCard').addEventListener('click', () => {
                    let overLayScreenUnlockCode = injectVariablesToHTML(overlaymodal, ".content", customdiscountcodescreen);

                    overLayScreenUnlockCode = injectVariablesToHTML(overLayScreenUnlockCode, ".unlock-heading .heading-text", `Redeem ${window.fc_loyalty_vars.coin_name || ''} Coins`);

                    overLayScreenUnlockCode = injectVariablesToHTML(overLayScreenUnlockCode, ".unlock-title", `Use ${window.fc_loyalty_vars.coin_name || ''} Coins to create a Discount Coupon`);

                    overLayScreenUnlockCode = injectVariablesToHTML(overLayScreenUnlockCode, ".unlock-desc", `10 ${window.fc_loyalty_vars.coin_name || ''} Coins for ₹10 off`);

                    overLayScreenUnlockCode = injectVariablesToHTML(overLayScreenUnlockCode, ".unlock-button-container .unlock-button", `Redeem ${window.fc_loyalty_vars.coin_name || ''} coins`);

                    const overlay = shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .overlay_modal');

                    overlay.innerHTML = overLayScreenUnlockCode;

                    (function openOverlay() {
                        if (window.innerHeight > 575 && window.innerHeight < 666) {
                            overlay.style.height = "70%"
                        } else if (window.innerHeight < 575 && window.innerHeight > 500) {
                            overlay.style.height = "80%"
                        } else if (window.innerHeight < 500) {
                            overlay.style.height = "90%"
                        } else {
                            overlay.style.height = "70%"
                        }
                        const scrolled = shadowRoot.querySelector('.fw_points__overlay.show_overlay').scrollTop;
                        overlay.style.bottom = `-${scrolled}px`;
                        const backDrop = document.createElement('div');
                        backDrop.innerHTML = `<div class="overlay_modal_backdrop"></div>`;
                        shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay').appendChild(backDrop);
                        shadowRoot.querySelector('.fw_points__overlay.show_overlay').style.overflowY = "hidden";

                    })();

                    shadowRoot.querySelector('.fw_points__overlay .overlay_modal .unlock-coupon-card .unlock-button-container #fw-redeem-ob-range').addEventListener('change', () => {
                        const value = shadowRoot.querySelector('.fw_points__overlay .overlay_modal .unlock-coupon-card .unlock-button-container #fw-redeem-ob-range').value

                        shadowRoot.querySelector('.fw_points__overlay .overlay_modal .unlock-coupon-card .unlock-desc').innerHTML = `${value} ${window.fc_loyalty_vars.coin_name || ''} Coins for ₹${value} off`
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
                                "coupon_title": `Custom Discount: ${value} ${window.fc_loyalty_vars.coin_name || ''} Coins for ₹${value} off`
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
                            walletAmount = walletData?.data?.data?.wallet?.wallet?.amount || 0;
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
                        overLayScreenUnlockCode = injectVariablesToHTML(overLayScreenUnlockCode, ".unlock-text", `Unlock for ${couponAmount} ${window.fc_loyalty_vars.coin_name || ''} Coins`)

                        const overlay = shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .overlay_modal');

                        overlay.innerHTML = overLayScreenUnlockCode;

                        (function openOverlay() {
                            if (window.innerHeight > 575 && window.innerHeight < 666) {
                                overlay.style.height = "70%"
                            } else if (window.innerHeight < 575 && window.innerHeight > 500) {
                                overlay.style.height = "80%"
                            } else if (window.innerHeight < 500) {
                                overlay.style.height = "90%"
                            } else {
                                overlay.style.height = "70%"
                            }
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
                                walletAmount = walletData?.data?.data?.wallet?.wallet?.amount || 0;
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
                            if (couponItem?.amount) {
                                UnlockedCouponsHTML += `
                                <div class="couponsContentCard">
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
                            } else {
                                UnlockedCouponsHTML += `
                                <div class="couponsContentCard">
                                    <div class="couponsContentImg">
                                        <p>Special</p>
                                        <p>Voucher</p>
                                    </div>
                                    <div class="couponsContentText">
                                        <h5>${couponItem?.title}</h5>
                                        <div class="couponCodeContainer"><p>code:</p><h5>${couponItem?.coupon}</h5></div>
                                        <p>created on ${couponItem?.date}</p>
                                    </div>
                                </div>`
                            }

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

