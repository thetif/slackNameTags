import { rest } from "msw";
import { SlackProfile, profileByUser } from "./profile.data";

interface ProfileRequestBody {
  user: string;
}

interface ProfileResponseBody {
  ok: boolean;
  profile: SlackProfile;
}

interface ProfileResponseBodyError {
  ok: boolean;
  error: string;
}

/**
 * Mock the endpoint for looking up profiles by user id in slack
 */
export const profileHandler = rest.post<
  ProfileRequestBody,
  ProfileRequestBody,
  ProfileResponseBody | ProfileResponseBodyError
>("https://slack.com/api/users.profile.get", async (req, res, ctx) => {
  const data = await req.arrayBuffer();
  const decoder = new TextDecoder().decode(data);
  const [key, value] = decoder.split("=");
  const user = decodeURIComponent(value);

  // look for the user in the mocked data
  const profile = profileByUser[user];

  if (!profile) {
    return res(
      ctx.json({
        ok: false,
        error: "user_not_found",
      })
    );
  }

  return res(
    ctx.json({
      ok: true,
      profile: profileByUser[user],
    })
  );
});
