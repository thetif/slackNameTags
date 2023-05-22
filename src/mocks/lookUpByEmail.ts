import { rest } from "msw";
import { userByEmail, SlackUser } from "./lookUpByEmail.data";

interface LookUpByEmailRequestBody {
  email: string;
}

interface LookUpByEmailResponseBody {
  ok: boolean;
  user: SlackUser;
}

interface LookUpByEmailResponseBodyError {
  ok: boolean;
  error: string;
}

/**
 * Mock the endpoint for looking up users by email in slack
 */
export const lookupHandler = rest.post<
  LookUpByEmailRequestBody,
  LookUpByEmailRequestBody,
  LookUpByEmailResponseBody | LookUpByEmailResponseBodyError
>("https://slack.com/api/users.lookupByEmail", async (req, res, ctx) => {
  const data = await req.arrayBuffer();
  const decoder = new TextDecoder().decode(data);
  const [key, value] = decoder.split("=");
  const email = decodeURIComponent(value);

  // look up the user in the mocked data
  const user = userByEmail[email];

  if (!user) {
    return res(
      ctx.json({
        ok: false,
        error: "users_not_found",
      })
    );
  }
  return res(
    ctx.json({
      ok: true,
      user: userByEmail[email],
    })
  );
});
