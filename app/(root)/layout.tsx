import HeadingNav from "@/component/root/heading-nav";
import { SiteFooter } from "@/component/root/footer";

export default function Layout({ children }: LayoutProps<"/">) {
    return (
        <>
            <HeadingNav />
            {children}
            <SiteFooter />
        </>
    );
}