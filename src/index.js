import signupscreen from "./components/signup-screen.html"
import loggedinscreen from "./components/loggedin-screen.html"
import overlaymodal from "./components/overlay-modal.html"
import { injectVariablesToHTML } from "./utils/utils"

(function loadfont() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600&display=swap';
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
        const walletAmount = walletData?.data?.data?.wallet?.amount

        const loggedInScreenHTML = injectVariablesToHTML(loggedinscreen, ".pointsBox .walletAmount", walletAmount)

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


                const overLayScreenPointsActivity = injectVariablesToHTML(overlaymodal, ".overlay_modal .content", `<div class="pointsActivityContainer"><h4>Points activity</h4>${walletPointsActivityHTML}</div>`)

                shadowRoot.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay').innerHTML = overLayScreenPointsActivity;

                shadowRoot.querySelector('.fw_points__overlay .overlay_modal .go-back-header .go-back-header-heading').addEventListener('click', function () {
                    loggedIn()
                });
            });


        })();
    }



}

