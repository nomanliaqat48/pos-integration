const { create } = require('xmlbuilder2');
const { sanitizeText } = require('../utils/helper');

function buildOrderXML(order) {
  const xmlObj = {
    IncomingOrder: {
      interface: {
        interfaceType: 'Generic',
        interfaceMethod: 'ftp'
      },
      source: {
        sourceType: 'Website',
        sourceVendor: 'Shopify'
      },
      order: {
        orderNumber: order.order_number,
        customer: {
          customerAcctId: '',
          customerBusinessName: order.customer.company || '',
          customerNameFirst: order.customer.first_name,
          customerNameLast: order.customer.last_name,
          customerPhone: order.customer.phone || '',
          customerAddress: order.billing_address.address1,
          customerCity: order.billing_address.city,
          customerState: order.billing_address.province_code,
          customerZip: order.billing_address.zip,
          customerCountry: order.billing_address.country_code,
          customerEmail: order.customer.email
        },
        recipient: {
          recipientFirstName: order.shipping_address.first_name,
          recipientLastName: order.shipping_address.last_name,
          recipientPhone: order.shipping_address.phone
        },
        card: {
          cardMessage: getCustomAttr(order, 'card_message') || '',
          cardType: 'Other'
        },
        delivery: {
          deliveryDate: getCustomAttr(order, 'delivery_date') || '',
          deliveryBusinessName: order.shipping_address.company || '',
          deliveryAddress1: order.shipping_address.address1,
          deliveryAddress2: order.shipping_address.address2 || '',
          deliveryCity: order.shipping_address.city,
          deliveryState: order.shipping_address.province_code,
          deliveryZipCode: order.shipping_address.zip,
          deliveryInstructions: order.note || '',
          deliveryCharge: order.total_shipping_price_set?.shop_money?.amount || '0.00',
          wireout: 'N',
          wireoutServiceCharge: '0.00',
          pickup: 'N',
          orderTaxPercent: '0.00',
          orderNotes: order.note || ''
        },
        product: {
          productDetails: order.line_items.map(item => ({
            productDetailsUnitCount: item.quantity,
            productDetailsUnitCost: item.price,
            productDetailsItemNumber: item.sku,
            productDetailsItemName: sanitizeText(item.name),
            productDetailsItemDescription: sanitizeText(item.title)
          }))
        },
        payment: {
          paymentType: 'CC',
          paymentCardType: '',
          paymentCardNumber: '',
          paymentCardExpiration: '',
          paymentCardCVS: '',
          paymentCardZip: order.billing_address.zip,
          paymentCardHolderName: `${order.billing_address.first_name} ${order.billing_address.last_name}`,
          paymentCardApproval: '',
          paymentCardTransID: '',
          discountValue: order.total_discounts || '0.00',
          discountCode: order.discount_codes?.[0]?.code || '',
          paymentTotal: order.total_price
        }
      }
    }
  };
  // console.log('xmlObj', xmlObj);
  const xml = create(xmlObj, { version: '1.0', encoding: 'UTF-8' });
  return xml.end({ prettyPrint: true });
}

function getCustomAttr(order, key) {
  const attrs = [...(order.note_attributes || []), ...(order.line_items[0]?.properties || [])];
  const attr = attrs.find((a) => a.name === key);
  return attr ? sanitizeText(attr.value) : '';
}

module.exports = { buildOrderXML };
