const ad = require('ad');



function createAd(containerId, adSlotId) {
            var adContainer = document.getElementById(containerId);
            var adElement = document.createElement("ins");
            adElement.className = "adsbygoogle";
            adElement.style.display = "block";
            adElement.dataset.adClient = "YOUR_AD_CLIENT_ID";
            adElement.dataset.adSlot = adSlotId;
            adElement.dataset.adFormat = "auto";
            adContainer.appendChild(adElement);

            // Initialize Google Ads
            (adsbygoogle = window.adsbygoogle || []).push({});
        }
