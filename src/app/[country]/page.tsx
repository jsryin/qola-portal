import { redirect } from "next/navigation";

export default async function CountryRoot({
    params,
}: {
    params: Promise<{ country: string }>;
}) {
    const { country } = await params;
    // 当访问 /ae 时，默认跳转到英文版 /ae/en
    redirect(`/${country}/en`);
}
