import signupscreen from "./components/spin-wheel-snippet/signup-screen.html"
import fullheightoverlaymodal from "./components/spin-wheel-snippet/full-height-overlay-modal.html"
import yourcouponsscreen from "./components/your-coupons-screen.html"
import exploregamescreen from "./components/spin-wheel-snippet/explore-game-screen.html"
import spinandwinscreen from "./components/spin-wheel-snippet/spin-and-win-screen.html"
import { drawWheel } from './spin-wheel';
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
document.querySelector('#fc-wallet-spin-wheel-snippet-19212').innerHTML = '';
document.querySelector('#fc-wallet-spin-wheel-snippet-19212').appendChild(container);


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

    const mainScript = document.querySelector('#fc-wallet-spin-wheel-snippet-script-19212');
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

            (async function showSpinWheels() {
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

                        spinAndWinWheel = injectVariablesToHTML(spinAndWinWheel, '.spin-wheel-bottom .unlock-wheel-text', `Unlock for ${spinWheelAmount} ${window.fc_loyalty_vars.coin_name || ''} Coins`);

                        shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .full_height_overlay_modal').innerHTML = spinAndWinWheel;

                        showLoadingScreen(true);

                        const res1 = await fetch('https://d3js.org/d3.v3.min.js');
                        const fileContent1 = await res1.text();
                        var script1 = document.createElement('script');
                        script1.innerHTML = fileContent1;

                        shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .full_height_overlay_modal .content .playArea').appendChild(script1);

                        const spinWheelRewardDataRes = await fetch(`${process.env.WALLET_API_URI}/get-spin-wheel-rewards`, {
                            "method": "POST",
                            "headers": {
                                "Content-Type": "application/json"
                            },
                            "body": JSON.stringify({
                                "customer_id": customer_id,
                                "user_hash": customer_tags,
                                "client_id": client_id,
                                "couponAmount": spinWheelAmount,
                            })
                        });

                        const spinWheelRewardDataReponse = await spinWheelRewardDataRes.json();
                        const spinWheelRewardData = spinWheelRewardDataReponse?.data;

                        drawWheel(shadowRoot, spinWheelRewardData.map((item, index) => {
                            return {
                                label: item,
                                value: index
                            }
                        }), false);

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

                            drawWheel(shadowRoot, spinWheelRewardData.map((item, index) => {
                                return {
                                    label: item,
                                    value: index
                                }
                            }), true, spinData?.data?.win_index, () => {
                                setTimeout(async function showSpinWheelWinningPopup() {
                                    shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .playArea .spinned-win-modal-container .spin-win-message').innerHTML = spinData?.data?.win_message;

                                    if (spinData?.data?.win_coupon) {
                                        shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .playArea .spinned-win-modal-container .spin-win-coupon p').innerHTML = `Coupon Code: ${spinData?.data?.win_coupon}`;

                                        const response = fetch(`${process.env.WALLET_API_URI}/save-static-user-coupon`, {
                                            "method": "POST",
                                            "headers": {
                                                "Content-Type": "application/json"
                                            },
                                            "body": JSON.stringify({
                                                customer_id: customer_id,
                                                user_hash: customer_tags,
                                                client_id: client_id,
                                                coupon_code: spinData?.data?.win_coupon,
                                                coupon_title: spinData?.data?.win_message
                                            })
                                        });
                                    }

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
                                    walletAmount = walletData?.data?.data?.wallet?.wallet?.amount || 0;
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

