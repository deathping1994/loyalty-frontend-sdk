// Load the HTML content into the shadow DOM
const container = document.createElement('div');
container.style.display = 'block';
container.style.all = 'initial';
const shadowRoot = container.attachShadow({ mode: 'open' });
shadowRoot.innerHTML = ``
document.body.appendChild(container);

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

async function redeemReferHash({ customer_id, customer_tags, client_id }) {
    const fc_refer_hash = localStorage.getItem("fc_refer_hash");
    if (fc_refer_hash) {
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
            localStorage.removeItem("fc_refer_hash")
        } catch (err) {
            console.log("error in redeemReferHash", err)
        }
    }
}

(function main() {

    const mainScript = document.querySelector('#fc-wallet-19212');
    const platform_type = mainScript.getAttribute('platform-type');

    async function loggedIn() {
        const customer_id = mainScript.getAttribute('data-customer-id');
        const customer_tags = mainScript.getAttribute('data-customer-tag')?.trim();
        const client_id = mainScript.getAttribute('data-client-id');

        if (customer_id) {
            await redeemReferHash({ customer_id, customer_tags, client_id });

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

