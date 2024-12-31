import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();

  const title = formData.get("title");
  const description = formData.get("description");
  const price = formData.get("price");
  const vendor = formData.get("vendor");
  const img = formData.get("img");
  console.log("img:", img);


  try {
    const response = await admin.graphql(
      `#graphql
          mutation populateProduct($product: ProductCreateInput!) {
            productCreate(product: $product) {
              product {
                id
                title
                descriptionHtml
                vendor
                variants(first: 10) {
                  edges {
                    node {
                      id
                      price
                      createdAt
                    }
                  }
                }
              }
            }
          }`,
      {
        variables: {
          product: {
            title,
            descriptionHtml: description,
            vendor,
          },
        },
      },
    );
    const responseJson = await response.json();
    const product = responseJson.data.productCreate.product;
    const variantId = product.variants.edges[0].node.id;

     // Step 2: Add the image to the product
    //  const mediaResponse = await admin.graphql(
    //   `#graphql
    //     mutation mediaCreate($productId: ID!, $mediaInput: MediaInput!) {
    //       mediaCreate(productId: $productId, media: $mediaInput) {
    //         media {
    //           id
    //           image {
    //             src
    //           }
    //         }
    //       }
    //     }`,
    //   {
    //     variables: {
    //       productId: product.id,
    //       mediaInput: {
    //         mediaContentType: "IMAGE",  // Specify it's an image
    //         originalSource: img,  // URL of the image
    //       },
    //     },
    //   }
    // );
    
    

    // const imageResponseJson = await mediaResponse.json();
    // console.log('imageResponseJson------>', imageResponseJson)

    const variantResponse = await admin.graphql(
      `#graphql
        mutation shopifyRemixTemplateUpdateVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
          productVariantsBulkUpdate(productId: $productId, variants: $variants) {
            productVariants {
              id
              price
              createdAt
            }
          }
        }`,
      {
        variables: {
          productId: product.id,
          variants: [{ id: variantId, price: price }],
        },
      },
    );
    const variantResponseJson = await variantResponse.json();

    return json({ success: true });
  } catch (error) {
    console.error("Unexpected error occurred:", error);
    return json(
      { error: ["Unexpected error occurred", error.message || ""] },
      { status: 500 },
    );
  }
};
