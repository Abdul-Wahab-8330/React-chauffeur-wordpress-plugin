function AuthCheckpoint({
    onLogin,
    onRegister,
}) {
    return (
        <section className="mb-6 rounded-[14px] border border-[#e5e5e5] bg-white p-5 shadow-[0_2px_14px_rgba(0,0,0,0.025)] sm:p-7">
            <div className="mx-auto max-w-[620px] text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#f7f7f5] text-[#222]">
                    <span className="text-[18px] font-semibold">01</span>
                </div>

                <p className="mb-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-[#8a6a24]">
                    Almost there
                </p>

                <h3 className="m-0 text-[22px] font-semibold tracking-[-0.02em] text-[#222]">
                    Sign in to continue
                </h3>

                <p className="mx-auto mt-2 max-w-[500px] text-[14px] leading-[1.6] text-[#666]">
                    Your journey details are saved. Sign in or create an
                    account to continue with your booking.
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <button
                        type="button"
                        onClick={onLogin}
                        className="min-h-[52px] w-full rounded-[10px] bg-[#222] px-6 text-[15px] font-semibold text-white transition hover:bg-[#333] sm:w-auto sm:min-w-[190px]"
                    >
                        Sign In
                    </button>

                    <button
                        type="button"
                        onClick={onRegister}
                        className="min-h-[52px] w-full rounded-[10px] border border-[#d9d9d9] bg-white px-6 text-[15px] font-semibold text-[#222] transition hover:bg-[#f7f7f5] sm:w-auto sm:min-w-[190px]"
                    >
                        Create Account
                    </button>
                </div>
            </div>
        </section>
    )
}

export default AuthCheckpoint