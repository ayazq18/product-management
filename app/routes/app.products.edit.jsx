// import { json } from "@remix-run/node";
// import { authenticate } from "../shopify.server";

// export const action = async ({ request }) => {
//   const { admin } = await authenticate.admin(request);
//   const formData = await request.formData();
//   const title = formData.get("title"); // Assuming this is the correct key for title
//   const description = formData.get("description");
//   const price = formData.get("price");
//   const vendor = formData.get("vendor");
//   const img = formData.get("img");
//   const id = formData.get("id");

//   try {
//     // Make the correct GraphQL mutation
//     const updateResponse = await admin.graphql(
//       `#graphql
//       mutation updateProduct($productInput: ProductInput!) {
//         productUpdate(input: $productInput) {
//           product {
//             id
//             title
//             descriptionHtml
//             vendor
//             variants(first: 10) {
//                   edges {
//                     node {
//                       id
//                       price
//                       createdAt
//                     }
//                   }
//                 }
//           }
//         }
//       }
//       `,
//       {
//         variables: {
//           productInput: {
//             id,
//             title,
//             descriptionHtml: description,
//             vendor,
//           },
//         },
//       },
//     );

//     if (updateResponse.errors) {
//       console.error("GraphQL errors:", updateResponse.errors);
//       return json({ errors: updateResponse.errors }, { status: 400 });
//     }

//     const responseJson = await updateResponse.json();
//     const product = responseJson.data.productUpdate.product;
//     const variantId = product.variants.edges[0].node.id;
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
//       },
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

  // Extract the form data
  const title = formData.get("title"); 
  const description = formData.get("description");
  const price = formData.get("price");
  const vendor = formData.get("vendor");
  const img = formData.get("img");
  const id = formData.get("id"); 

  try {
    await axios.put(`http://localhost:5000/products/update`, {
      title,
      description,
      vendor,
      price,
      imageUrl:img,
      productId:id,
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
