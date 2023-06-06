import signupscreen from "./components/signup-screen.html"
import loggedinscreen from "./components/loggedin-screen.html"
import overlaymodal from "./components/overlay-modal.html"
import fullheightoverlaymodal from "./components/full-height-overlay-modal.html"
import couponsscreen from "./components/coupons-screen.html"
import yourcouponsscreen from "./components/your-coupons-screen.html"

import unlockcodescreen from "./components/unlock-code-screen.html"

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

    widgetButton.addEventListener('click', function () {
        if (cardContainer.style.display === 'none') {
            cardContainer.style.display = 'block';
        } else {
            cardContainer.style.display = 'none';
        }
    });

    headerClose.addEventListener('click', function () {
        if (cardContainer.style.display === 'none') {
            cardContainer.style.display = 'block';
        } else {
            cardContainer.style.display = 'none';
        }
    });
})();

window.onload = async function loggedIn() {
    const mainScript = document.querySelector('#fc-wallet-19212');
    const customer_id = mainScript.getAttribute('data-customer-id');
    const customer_tags = mainScript.getAttribute('data-customer-tag')?.trim();

    if (customer_id && customer_tags) {
        const response = await fetch(`${process.env.WALLET_API_URI}/walletlogs`, {
            "method": "POST",
            "headers": {
                "Content-Type": "application/json"
            },
            "body": JSON.stringify({
                "customer_id": customer_id,
                "user_hash": customer_tags
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
                "user_hash": customer_tags
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
                        const backDrop = document.createElement('div');
                        backDrop.innerHTML = `<div class="overlay_modal_backdrop"></div>`;
                        shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay').appendChild(backDrop);
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
                                "couponAmount": couponAmount
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
                            const backDrop = shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .overlay_modal_backdrop');
                            backDrop.parentNode.removeChild(backDrop);
                            overlay.innerHTML = '';
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

                yourCouponsTab.addEventListener('click', () => {
                    const overLayScreenPointsActivityYourCoupons = injectVariablesToHTML(fullheightoverlaymodal, ".full_height_overlay_modal .content", `<div class="couponsScreenContainer"><h4>Coupons</h4>
                ${yourcouponsscreen}</div>`)
                    shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay').innerHTML = overLayScreenPointsActivityYourCoupons;

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
                })

                shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .full_height_overlay_modal .go-back-header .close').addEventListener('click', () => {
                    loggedIn();
                })
            })
        })();
    }
}

