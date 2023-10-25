# fw-script


## Installation

Use this script tag with the specific client id in "data-client-id" attribute in theme.liquid at last in the body tag

```bash
  {% assign customerTagValue = '' %}{% for tag in customer.tags %}{% if tag contains 'wallet' %}{% assign customerTagValue = tag | split: '_' | last %}{% break %}{% endif %}{% endfor %}
<script src="https://static.farziengineer.co/farziwallet/index.js" id="fc-wallet-19212" data-customer-id="{{ customer.id }}" data-customer-tag="{{ customerTagValue }}" data-client-id="Q2xpZW50OjY="></script>
```
    
