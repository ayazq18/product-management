import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const id = formData.get("id");


  try {
    const deleteResponse = await admin.graphql(
      `#graphql
      mutation deleteProduct($id: ID!) {
        productDelete(input:{id: $id}) {
         deletedProductId
        }
      }
      `,
      {
        variables: {
         id,
        },
      }
    );

    if (deleteResponse.errors) {
      console.error("GraphQL errors:", deleteResponse.errors);
      return json({ errors: deleteResponse.errors }, { status: 400 });
    }

    return json({ success: true });
  } catch (error) {
    console.error("Unexpected error occurred:", error);
    return json({ error: ["Unexpected error occurred", error.message || ""] }, { status: 500 });
  }
};
