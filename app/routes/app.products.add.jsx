// import { json } from "@remix-run/node";
// import { authenticate } from "../shopify.server";

// export const action = async ({ request }) => {
//   const { admin } = await authenticate.admin(request);
//   const formData = await request.formData();

//   const title = formData.get("title");
//   const description = formData.get("description");
//   const price = formData.get("price");
//   const vendor = formData.get("vendor");
//   const img = formData.get("img"); // Image URL
//   console.log("img---->", img);

//   try {
//     // Step 1: Create the product using GraphQL
//     const response = await admin.graphql(
//       `#graphql
//           mutation populateProduct($product: ProductCreateInput!) {
//             productCreate(product: $product) {
//               product {
//                 id
//                 title
//                 descriptionHtml
//                 vendor
//                 variants(first: 10) {
//                   edges {
//                     node {
//                       id
//                       price
//                       createdAt
//                     }
//                   }
//                 }
//               }
//             }
//           }`,
//       {
//         variables: {
//           product: {
//             title,
//             descriptionHtml: description,
//             vendor,
//           },
//         },
//       },
//     );

//     const responseJson = await response.json();
//     const product = responseJson.data.productCreate.product;
//     const variantId = product.variants.edges[0].node.id;

//     // Step 2: Add the image to the product using ProductVariantsBulkUpdate mutation
//     if (img) {
//       const mediaResponse = await admin.graphql(
//         `#graphql
//           mutation ProductVariantsBulkUpdate(
//             $productId: ID!
//             $variants: [ProductVariantsBulkInput!]!
//             $img: String!
//           ) {
//             productVariantsBulkUpdate(
//               productId: $productId
//               variants: $variants
//               allowPartialUpdates: true
//               media: {
//                 originalSource: $img
//                 mediaContentType: IMAGE
//               }
//             ) {
//               product {
//                 id
//               }
//               productVariants {
//                 media(first: 10) {
//                   nodes {
//                     id
//                     ... on MediaImage {
//                       alt
//                       createdAt
//                       fileStatus
//                       id
//                       mediaContentType
//                       mimeType
//                       status
//                       updatedAt
//                       fileErrors {
//                         code
//                         details
//                         message
//                       }
//                     }
//                   }
//                 }
//               }
//             }
//           }`,
//         {
//           variables: {
//             productId: product.id,
//             variants: [{ id: variantId }],
//             img: img, // Image URL
//           },
//         }
//       );

//       const mediaResponseJson = await mediaResponse.json();
//       console.log("mediaResponseJson------>", mediaResponseJson);
//     }

//     // Step 3: Update the product variant price
//     const variantResponse = await admin.graphql(
//       `#graphql
//         mutation shopifyRemixTemplateUpdateVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
//           productVariantsBulkUpdate(productId: $productId, variants: $variants) {
//             productVariants {
//               id
//               price
//               createdAt
//             }
//           }
//         }`,
//       {
//         variables: {
//           productId: product.id,
//           variants: [{ id: variantId, price: price }],
//         },
//       }
//     );
    
//     const variantResponseJson = await variantResponse.json();

//     return json({ success: true });
//   } catch (error) {
//     console.error("Unexpected error occurred:", error);
//     return json(
//       { error: ["Unexpected error occurred", error.message || ""] },
//       { status: 500 },
//     );
//   }
// };


import axios from "axios";
import { json } from "@remix-run/node";

export const action = async ({ request }) => {
  const formData = await request.formData();

  const title = formData.get("title");
  const description = formData.get("description");
  const price = formData.get("price");
  const vendor = formData.get("vendor");
  const img = formData.get("img"); // Image URL

  try {
    await axios.post("http://localhost:5000/products/create", {
      title,
      description,
      vendor,
      price,
      imageUrl:img,
    });

    return json({ success: true });
  } catch (error) {
    console.error("Unexpected error occurred:", error);
    return json(
      { error: ["Unexpected error occurred", error.message || ""] },
      { status: 500 },
    );
  }
};
