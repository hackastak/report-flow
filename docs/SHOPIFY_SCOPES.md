# Report Flow - Shopify API Scopes

## Overview

This document explains the Shopify API access scopes required by the Report Flow app and why each scope is necessary.

## Configured Scopes

The following scopes are configured in `shopify.app.toml`:

```toml
scopes = "read_orders,read_products,read_customers,read_reports,read_analytics,read_inventory,read_locations,read_price_rules,read_discounts"
```

## Scope Breakdown

### Core Report Data Scopes

#### `read_orders`
**Purpose:** Access order data for sales and order reports

**Enables:**
- Sales reports (revenue, order count, average order value)
- Order status reports (fulfilled, pending, cancelled)
- Order timeline reports
- Customer purchase history

**GraphQL Objects:**
- `Order`
- `OrderTransaction`
- `Fulfillment`

**Note:** By default, this scope provides access to orders from the last 60 days. For historical data beyond 60 days, the app would need to request the `read_all_orders` scope (requires special permission from Shopify).

---

#### `read_products`
**Purpose:** Access product data for inventory and product performance reports

**Enables:**
- Product sales reports
- Inventory reports
- Product performance analysis
- Collection reports
- Variant analysis

**GraphQL Objects:**
- `Product`
- `ProductVariant`
- `Collection`

---

#### `read_customers`
**Purpose:** Access customer data for customer analytics reports

**Enables:**
- Customer acquisition reports
- Customer lifetime value reports
- Customer segmentation reports
- Repeat customer analysis
- Customer demographics

**GraphQL Objects:**
- `Customer`
- `Segment`

**Important:** This scope provides access to customer data. The app must comply with Shopify's data protection requirements and only use customer data for generating reports as requested by the merchant.

---

### Analytics & Reporting Scopes

#### `read_reports`
**Purpose:** Access Shopify's built-in reports and analytics

**Enables:**
- Access to Shopify's native report data
- Pre-calculated analytics metrics
- Historical report data

**Note:** This scope may provide access to Shopify's Reports API if available in the API version being used.

---

#### `read_analytics`
**Purpose:** Access analytics data and metrics

**Enables:**
- Traffic analytics
- Conversion metrics
- Sales analytics
- Performance metrics

**Note:** This scope provides access to aggregated analytics data that Shopify calculates.

---

### Supporting Data Scopes

#### `read_inventory`
**Purpose:** Access inventory levels and tracking data

**Enables:**
- Inventory level reports
- Stock movement reports
- Low stock alerts
- Inventory by location

**GraphQL Objects:**
- `InventoryLevel`
- `InventoryItem`

---

#### `read_locations`
**Purpose:** Access store location data

**Enables:**
- Multi-location inventory reports
- Sales by location reports
- Location-specific analytics

**GraphQL Objects:**
- `Location`

**Use Case:** Essential for merchants with multiple store locations or warehouses to generate location-specific reports.

---

#### `read_price_rules`
**Purpose:** Access pricing rules and promotions

**Enables:**
- Promotion performance reports
- Discount usage reports
- Price rule effectiveness analysis

**GraphQL Objects:**
- `PriceRule`

---

#### `read_discounts`
**Purpose:** Access discount codes and automatic discounts

**Enables:**
- Discount code usage reports
- Discount performance analysis
- Promotion ROI reports

**GraphQL Objects:**
- Discount-related objects in the Discounts API

---

## Report Type to Scope Mapping

| Report Type | Required Scopes |
|-------------|----------------|
| **Sales Reports** | `read_orders`, `read_products`, `read_analytics` |
| **Order Reports** | `read_orders`, `read_customers` |
| **Product Reports** | `read_products`, `read_inventory`, `read_orders` |
| **Customer Reports** | `read_customers`, `read_orders` |
| **Inventory Reports** | `read_inventory`, `read_products`, `read_locations` |
| **Traffic Reports** | `read_analytics` |
| **Discount Reports** | `read_discounts`, `read_price_rules`, `read_orders` |

---

## Scope Installation Flow

When a merchant installs the Report Flow app:

1. **Authorization Request:** Shopify presents the merchant with a list of requested scopes
2. **Merchant Approval:** Merchant reviews and approves the scope requests
3. **Token Generation:** Shopify generates an access token with the approved scopes
4. **Token Storage:** The app stores the access token securely in the database (Session table)
5. **API Access:** The app uses the token to make authenticated API requests

---

## Scope Updates

If we need to add additional scopes in the future:

1. Update `shopify.app.toml` with new scopes
2. Deploy the updated app configuration
3. Existing installations will receive a `app/scopes_update` webhook
4. Merchants must re-authorize the app to grant new scopes
5. The app handles the webhook in `app/routes/webhooks.app.scopes_update.tsx`

---

## Security & Privacy Considerations

### Data Minimization
The app requests only the minimum scopes necessary to provide report functionality. We use **read-only** scopes exclusively - no write permissions are requested.

### Customer Data Protection
- Customer data accessed via `read_customers` is used solely for generating reports
- No customer data is stored permanently by the app
- Reports are generated on-demand and sent via email
- The app complies with GDPR, CCPA, and Shopify's data protection requirements

### Access Token Security
- Access tokens are stored securely in the database
- Tokens are encrypted at rest
- Tokens are never exposed to the client-side code
- Tokens are used only for server-side API requests

---

## Testing Scopes

During development, you can test scope access:

1. **Check Granted Scopes:**
```graphql
query {
  appInstallation {
    accessScopes {
      handle
      description
    }
  }
}
```

2. **Test API Access:**
Try fetching data for each report type to ensure scopes are working correctly.

3. **Handle Missing Scopes:**
If a scope is missing, the app should gracefully handle the error and inform the user.

---

## Future Scope Considerations

Potential scopes we might need in the future:

- **`read_all_orders`** - For historical data beyond 60 days (requires Shopify approval)
- **`read_fulfillments`** - For detailed fulfillment reports
- **`read_shipping`** - For shipping and delivery reports
- **`read_marketing_events`** - For marketing campaign reports
- **`read_online_store_pages`** - For content performance reports

---

## References

- [Shopify API Access Scopes Documentation](https://shopify.dev/docs/api/usage/access-scopes)
- [App Configuration Documentation](https://shopify.dev/docs/apps/tools/cli/configuration#access_scopes)
- [Managing Access Scopes](https://shopify.dev/docs/apps/build/authentication-authorization/app-installation/manage-access-scopes)

