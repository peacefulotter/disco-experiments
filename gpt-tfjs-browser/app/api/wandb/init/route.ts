import { wandb } from "@wandb/sdk";

export async function POST(req: Request) {
  const { config, prefix, date } = await req.json();
  await wandb.init({
    project: config.wandbProject,
    name: `${prefix}_${config.wandbName}`,
    config: { ...config, date },
  });
  return Response.json("");
}
