import signupscreen from "./components/scratch-card-snippet/signup-screen.html"
import fullheightoverlaymodal from "./components/scratch-card-snippet/full-height-overlay-modal.html"
import yourcouponsscreen from "./components/your-coupons-screen.html"
import exploregamescreen2 from "./components/scratch-card-snippet/explore-game-screen.html"
import scratchcardscreen from "./components/scratch-card-snippet/scratch-card-screen.html"
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
document.querySelector('#fc-wallet-scratch-card-snippet-19212').innerHTML = '';
document.querySelector('#fc-wallet-scratch-card-snippet-19212').appendChild(container);


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

    const mainScript = document.querySelector('#fc-wallet-scratch-card-snippet-script-19212');
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

            (async function showScratchCards() {
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

                        scratchCardScreenHTML = injectVariablesToHTML(scratchCardScreenHTML, '.scratch-card-bottom .unlock-card-text', `Unlock for ${scratchCardAmount} ${window.fc_loyalty_vars.coin_name || ''} Coins`);

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


                            if (scratchCardData?.data?.win_coupon) {
                                shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .playArea #fw-chart-scratch-card .scratch-card-base p').innerHTML = `Coupon Code: ${scratchCardData?.data?.win_coupon}`;
                            }

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

                                        if (scratchCardData?.data?.win_coupon) {
                                            shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay .playArea .scratched-win-modal-container .scratch-win-coupon p').innerHTML = `Coupon Code: ${scratchCardData?.data?.win_coupon}`;

                                            const response = fetch(`${process.env.WALLET_API_URI}/save-static-user-coupon`, {
                                                "method": "POST",
                                                "headers": {
                                                    "Content-Type": "application/json"
                                                },
                                                "body": JSON.stringify({
                                                    customer_id: customer_id,
                                                    user_hash: customer_tags,
                                                    client_id: client_id,
                                                    coupon_code: scratchCardData?.data?.win_coupon,
                                                    coupon_title: scratchCardData?.data?.win_message
                                                })
                                            });
                                        }

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
                                        walletAmount = walletData?.data?.data?.wallet?.wallet?.amount || 0;
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

                            document.body.scrollTop = 0; // For Safari
                            document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
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

