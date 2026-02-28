import { redirect } from "next/navigation";

export const runtime = 'edge';

export default function RegionsRoot() {
    // 当用户访问根节点 /countries 时，作为兜底，默认重定向到英文版导航页
    // 实际项目中，您也可以在这里读取 header 中的 Accept-Language 进行智能重定向
    redirect("/countries/en");
}
