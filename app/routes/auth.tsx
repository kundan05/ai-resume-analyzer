import { usePuterStore } from "~/lib/puter";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { HeroGeometric } from "~/components/ui/shape-landing-hero";
import { LiquidButton } from "~/components/ui/liquid-glass-button";

export const meta = () => ([
    { title: 'GoodLuck | Auth' },
    { name: 'description', content: 'Log into your account' },
])

const Auth = () => {
    const { isLoading, auth } = usePuterStore();
    const location = useLocation();
    const next = location.search.split('next=')[1];
    const navigate = useNavigate();

    useEffect(() => {
        if (auth.isAuthenticated) navigate(next);
    }, [auth.isAuthenticated, next])

    return (
        <HeroGeometric
            badge="Authentication"
            title1="Start Your"
            title2="Journey"
        >
            <div className="relative z-10 w-full max-w-md mx-auto px-4 pb-20">
                <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 md:p-10 rounded-2xl shadow-2xl flex flex-col gap-8 items-center">
                    <div className="flex flex-col items-center gap-3 text-center">
                        <h1 className="text-3xl font-bold text-white">Welcome</h1>
                        <h2 className="text-white/60 font-light">Log In to Continue Your Job Journey</h2>
                    </div>

                    <div className="w-full">
                        {isLoading ? (
                            <LiquidButton className="w-full text-white cursor-wait opacity-80" disabled>
                                Signing you in...
                            </LiquidButton>
                        ) : (
                            <>
                                {auth.isAuthenticated ? (
                                    <LiquidButton className="w-full text-white" onClick={auth.signOut}>
                                        Log Out
                                    </LiquidButton>
                                ) : (
                                    <LiquidButton className="w-full text-white" onClick={auth.signIn}>
                                        Log In
                                    </LiquidButton>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </HeroGeometric>
    )
}

export default Auth
