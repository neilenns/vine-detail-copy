// content.js

// Function to inject the button
function injectButton(mutations, observer) {
  // Huge amount of nonsense to find the footer where the button goes. Once it's found once
  // though we luckily never have to find it again.
  const found = [];
  for (const { addedNodes } of mutations) {
    for (const node of addedNodes) {
      if (!node.tagName) continue; // not an element
      if (node.classList.contains("vvp-modal-footer")) {
        found.push(node);
      } else if (node.firstElementChild) {
        found.push(...node.getElementsByClassName("vvp-modal-footer"));
      }
    }
  }

  // There are lots of mutation events that get fired, only one of which will ever
  // have the element we need. For all the others just bail.
  if (found === null || found.length === 0) {
    return;
  }

  console.log("Found a popover modal footer");
  const foundJq = $(found);

  // Create the button that's used to copy the product details. It's styled
  // close enough to the Amazon buttons.
  var button = $(`<button/>`, {
    css: {
      "background-color": "transparent",
      border: 0,
    },
    click: function () {
      const titleLink = $("#vvp-product-details-modal--product-title")[0];
      const taxValue = $("#vvp-product-details-modal--tax-value-string")[0];
      const isLimited =
        $($("#vvp-product-details-modal--limited-quantity")[0]).css(
          "display"
        ) !== "none";
      const isFree = parseFloat(taxValue.innerText.replace("$", "")) === 0;

      const detailString = `${
        isFree ? "@free " : ""
      }${titleLink.innerText.substring(0, 150)} ${taxValue.innerText}${
        isLimited ? " limited " : " "
      }${titleLink.href} `;

      const decodedString = he.decode(detailString);
      navigator.clipboard
        .writeText(decodedString)
        .then(() => {
          console.log(decodedString);
        })
        .catch((err) => {
          console.error("Unable to copy product details to the clipboard", err);
        });
    },
  });

  // Create the button image then add it all to the pop-up
  var img = $(`<img src="${chrome.runtime.getURL("images/copy-solid.svg")}"/>`);
  button.prepend(img);
  foundJq.prepend(button);

  // Stop watching for document changes since we found what we need.
  observer.disconnect();
}

// Create a MutationObserver to watch for changes in the DOM
const observer = new MutationObserver(injectButton);

// Specify the target node and options for the observer
const observerConfig = { childList: true, subtree: true };

// Start observing the target node for changes
observer.observe(document.body, observerConfig);
