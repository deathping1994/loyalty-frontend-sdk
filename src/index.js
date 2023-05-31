import signup from "./components/signup.html"

// Load the HTML content into the DOM
document.body.innerHTML += signup;


(function popUptoggleOnAndOff() {
    var widgetButton = document.getElementById('widget-container');
    var cardContainer = document.getElementById('card-container');
    var headerClose = document.getElementById('header-close');

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
        const response = await fetch("http://localhost:3000/walletlogs", {
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

        const cardConatiner = document.querySelector('.fw_points.XXsnipcss_extracted_selector_selectionXX .fw_points__overlay');
        cardConatiner.innerHTML = `
        <div class="header">
            <img id="header-close" class="close" src="https://earthrhythm-media.farziengineer.co/hosted/icons8-multiply-50-c78740eccab9.png" alt="close header" width="30px">
            <div class="">
                <h1 class="heading">Welcome to</h1>
                <p>Loyalty</p>
            </div>
            </div>
            <div class="content">
            <div class="cardWrapper points">
                <div class="dropDown">
                    <div class="dropDown__content">
                        <p class="">My points </p>
                    </div>
                    <div class="pointsBox">
                    <p>${walletAmount}</p>
                    </div>
                </div>
            </div>
            <div>
            <div class="cardContainer">
                <div class="rowHead">
                <p>Coupons</p>
                <div>View all</div>
                </div>
            </div>
            <div class="cardContainer cardRow">
                <div class="card">
                    <p>Rs. 10 off on Striped Silk Blouse</p>
                    <div class="couponValue">10</div>
                </div>
                <div class="card">
                    <p>Rs. 30 off on Striped Silk Blouse</p>
                    <div class="couponValue">30</div>
                </div>
            </div>

            <!--
            <div class="cardWrapper pointsActivity">
                
                
            </div>
            -->
            </div>
            </div>
            </div>
        `
        let walletPointsActivityHTML = '<h1>Points activity</h1>';
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
                        <p class="" style="color:${color}">${symbol} ${edge.node.amount} points</p>
                        <p class="">${new Date(edge.node.created)?.toISOString()?.split('T')?.[0]}</p>
                        </div>
                    </div>
                </div>
            `
        });

        document.querySelector('.pointsActivity').innerHTML = walletPointsActivityHTML;
    }



}

