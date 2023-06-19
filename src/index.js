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

function showLoadingScreen() {
    const loadingBackDrop = document.createElement('div');
    loadingBackDrop.innerHTML = `${loadingscreen}`;
    shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay').appendChild(loadingBackDrop);
}

window.onload = async function loggedIn() {
    showLoadingScreen();
    const mainScript = document.querySelector('#fc-wallet-19212');
    const customer_id = mainScript.getAttribute('data-customer-id');
    const customer_tags = mainScript.getAttribute('data-customer-tag')?.trim();
    const client_id = mainScript.getAttribute('data-client-id');

    if (customer_id && customer_tags) {
        const response = await fetch(`${process.env.WALLET_API_URI}/walletlogs`, {
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
        const walletAmount = walletData?.data?.data?.wallet?.amount;

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
                walletData?.data?.data?.wallet?.logs?.edges?.forEach((edge) => {
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
                            <p style="color:${color};font-weight:600">${symbol}${edge.node.amount} points</p>
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
                    loggedIn()
                });
            });


        })();

        function redeemCodeOnClick() {
            shadowRoot.querySelectorAll('.fw_points__overlay .content .couponCodes .cardContainer.cardRow .card').forEach((element) => {
                element.addEventListener('click', function (event) {

                    const couponCardIndex = event.target.getAttribute("data-coupon-idx");
                    const selectedCouponData = couponCardIndex && couponData[couponCardIndex];
                    const couponAmount = selectedCouponData?.amount;

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
                        const response = await fetch(`${process.env.WALLET_API_URI}/get-code`, {
                            "method": "POST",
                            "headers": {
                                "Content-Type": "application/json"
                            },
                            "body": JSON.stringify({
                                "customer_id": customer_id,
                                "user_hash": customer_tags,
                                "couponAmount": couponAmount,
                                "client_id": client_id
                            })
                        });
                        const couponData = await response.json();
                        shadowRoot.querySelector('.fw_points__overlay .overlay_modal .content .unlock-coupon-card .unlock-button-container').innerHTML = `
                        <p class="unlock-text">Use this code at checkout</p>
                        <div class="revealed-code"><p>${couponData?.data?.coupon_code}</p><img src="https://earthrhythm-media.farziengineer.co/hosted/Vector-d42544500181.png"/><p class="copied-alert">copied</p></div>
                        `;
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
            shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .couponCodes .viewAllCoupons').addEventListener('click', function showViewAllCouponsScreen() {
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
                                    <p>code viewed on ${couponItem?.date}</p>
                                </div>
                            </div>`
                        });
                    } else {
                        UnlockedCouponsHTML = `
                        <div class="no-coupons-found">
                            <div><img src="https://earthrhythm-media.farziengineer.co/hosted/image_24-c96b6aaf23b2.png"/></div>
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
                        loggedIn();
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
                                    <p>code viewed on ${couponItem?.date}</p>
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
                                    <p>code viewed on ${couponItem?.date}</p>
                                </div>
                            </div>`
                            });
                        } else {
                            giftedCouponsHTML = `
                            <div class="no-coupons-found">
                                <div><img src="https://earthrhythm-media.farziengineer.co/hosted/image_24-c96b6aaf23b2.png"/></div>
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
                    loggedIn();
                })
            })
        })();

        (function exploreWheel() {
            shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .gameArena #gameArenacard-wheelOfFortune .gameArenaBtn').addEventListener('click', async function showSpinWheels() {
                let overLayScreenPointsActivity = injectVariablesToHTML(fullheightoverlaymodal, ".full_height_overlay_modal .content", `<div class="couponsScreenContainer"><h4>Wheel of Fortune</h4>
                ${exploregamescreen}</div>`);

                overLayScreenPointsActivity = injectVariablesToHTML(overLayScreenPointsActivity, ".top-head .top-head-points .points-wrapper", `${walletAmount}`);

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

                        const res1 = await fetch('https://d3js.org/d3.v3.min.js');
                        const fileContent1 = await res1.text();
                        var script1 = document.createElement('script');
                        script1.innerHTML = fileContent1;

                        shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .full_height_overlay_modal .content .playArea').appendChild(script1);

                        drawWheel(shadowRoot, Array.from({ length: 6 }, () => ({ label: "", value: 5 })), false);

                        shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .playArea .unlock-spin-wheel-btn').addEventListener('click', async () => {
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

                            const unlockedWheel = shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .playArea #fw-chart-spin-wheel svg')
                            unlockedWheel.parentNode.removeChild(unlockedWheel);

                            drawWheel(shadowRoot, Array.from({ length: 6 }, () => ({ label: spinData?.data?.win_message, value: 5 })), true, () => {
                                setTimeout(function showSpinWheelWinningPopup() {
                                    shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .playArea .spinned-win-modal-container .spin-win-message').innerHTML = spinData?.data?.win_message;

                                    shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .playArea .spinned-win-modal-container').style.height = "100%";

                                    shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .playArea .spinned-win-modal-container .spin-win-play-again button').addEventListener('click', () => {
                                        openWheelScreen(null, spinWHeelCardIndex);
                                    })

                                    shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .playArea .spinned-win-modal-container .spin-win-close button').addEventListener('click', () => {
                                        showSpinWheels();
                                    })
                                }, 1000)

                            });

                            shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .playArea #fw-chart-spin-wheel img').style.display = "none";

                            shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .playArea #fw-chart-spin-wheel svg').style.opacity = 1;

                            shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .playArea .unlock-wheel-text').innerHTML = "Click 'SPIN' to start";

                            shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .playArea .unlock-spin-wheel-btn').style.display = "none";
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
                                    <p>code viewed on ${couponItem?.date}</p>
                                </div>
                            </div>`
                        });
                    } else {
                        UnlockedCouponsHTML = `
                        <div class="no-coupons-found">
                            <div><img src="https://earthrhythm-media.farziengineer.co/hosted/image_24-c96b6aaf23b2.png"/></div>
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
                        loggedIn();
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
                                    <p>code viewed on ${couponItem?.date}</p>
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
                                    <p>code viewed on ${couponItem?.date}</p>
                                </div>
                            </div>`
                            });
                        } else {
                            giftedCouponsHTML = `
                            <div class="no-coupons-found">
                                <div><img src="https://earthrhythm-media.farziengineer.co/hosted/image_24-c96b6aaf23b2.png"/></div>
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
                    loggedIn();
                })
            })
        })();

        (function exploreScratchCards() {
            shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .gameArena #gameArenacard-scratchCard .gameArenaBtn').addEventListener('click', async function showScratchCards() {
                let overLayScreenPointsActivity = injectVariablesToHTML(fullheightoverlaymodal, ".full_height_overlay_modal .content", `<div class="couponsScreenContainer"><h4>Scratch Card</h4>
                ${exploregamescreen2}</div>`);

                overLayScreenPointsActivity = injectVariablesToHTML(overLayScreenPointsActivity, ".top-head .top-head-points .points-wrapper", `${walletAmount}`);

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

                            shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .playArea #fw-chart-scratch-card .scratch-card-base h4').innerHTML = scratchCardData?.data?.win_message;

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
                                const scratch = (x, y) => {
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
                                    if (scratchedPixels >= threshold) {
                                        shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .playArea .scratched-win-modal-container .scratch-win-message').innerHTML = scratchCardData?.data?.win_message;

                                        shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .playArea .scratched-win-modal-container').style.height = "100%";

                                        shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .playArea .scratched-win-modal-container .scratch-win-play-again button').addEventListener('click', () => {
                                            openScratchCardScreen(null, scratchCardIndex);
                                        })

                                        shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .playArea .scratched-win-modal-container .scratch-win-close button').addEventListener('click', () => {
                                            //TODO ERROR-- RUNNING MULITPLE TIMES WHEN CLICKED ONLY ONCE
                                            showScratchCards();
                                        })
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
                                    <p>code viewed on ${couponItem?.date}</p>
                                </div>
                            </div>`
                        });
                    } else {
                        UnlockedCouponsHTML = `
                        <div class="no-coupons-found">
                            <div><img src="https://earthrhythm-media.farziengineer.co/hosted/image_24-c96b6aaf23b2.png"/></div>
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
                        loggedIn();
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
                                    <p>code viewed on ${couponItem?.date}</p>
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
                                    <p>code viewed on ${couponItem?.date}</p>
                                </div>
                            </div>`
                            });
                        } else {
                            giftedCouponsHTML = `
                            <div class="no-coupons-found">
                                <div><img src="https://earthrhythm-media.farziengineer.co/hosted/image_24-c96b6aaf23b2.png"/></div>
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
                    loggedIn();
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
                    image: "https://earthrhythm-media.farziengineer.co/hosted/image_10-18d83e52d14a.png",
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
                                    <p>code viewed on ${couponItem?.date}</p>
                                </div>
                            </div>`
                        });
                    } else {
                        UnlockedCouponsHTML = `
                        <div class="no-coupons-found">
                            <div><img src="https://earthrhythm-media.farziengineer.co/hosted/image_24-c96b6aaf23b2.png"/></div>
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
                        loggedIn();
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
                                    <p>code viewed on ${couponItem?.date}</p>
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
                                    <p>code viewed on ${couponItem?.date}</p>
                                </div>
                            </div>`
                            });
                        } else {
                            giftedCouponsHTML = `
                            <div class="no-coupons-found">
                                <div><img src="https://earthrhythm-media.farziengineer.co/hosted/image_24-c96b6aaf23b2.png"/></div>
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
                    loggedIn();
                })
            })
        })();

        (function inviteFriends() {
            shadowRoot.querySelector('.fw_points__overlay .content .invite-friends-wrapper .invite-friends-button button').addEventListener('click', async () => {

                let overLayScreenUnlockCode = injectVariablesToHTML(overlaymodal, ".content", inviteandearnpopup)

                const overlay = shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .overlay_modal');

                overlay.innerHTML = overLayScreenUnlockCode;

                (function openOverlay() {
                    overlay.style.height = "82%";
                    const scrolled = shadowRoot.querySelector('.fw_points__overlay.show_overlay').scrollTop;
                    overlay.style.bottom = `-${scrolled}px`;
                    const backDrop = document.createElement('div');
                    backDrop.innerHTML = `<div class="overlay_modal_backdrop"></div>`;
                    shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay').appendChild(backDrop);

                    shadowRoot.querySelector('.fw_points__overlay.show_overlay').style.overflowY = "hidden";
                })();

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
                const referralCode = referralCodeData?.data?.referral_code;

                shadowRoot.querySelector('.fw_points__overlay .overlay_modal .invite-and-earn-popup .revealed-code p').innerHTML = referralCode;

                shadowRoot.querySelector('.fw_points__overlay .overlay_modal .content .unlock-coupon-card .revealed-code img').addEventListener('click', () => {
                    navigator.clipboard.writeText(referralCode);
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

