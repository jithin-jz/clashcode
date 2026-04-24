import React from "react";
import { Gift, Check, Copy } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

const ReferralSection = ({
  currentUser,
  copied,
  handleCopyReferral,
  referralCodeInput,
  setReferralCodeInput,
  handleRedeemReferral,
  isRedeeming,
}) => {
  return (
    <Card className="bg-[#141414]/70 border-[#404040]/20">
      <CardHeader className="p-4 border-b border-white/5">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Gift size={14} className="text-neutral-400" /> Referral
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between bg-[#1a1a1a]/50 p-2.5 rounded-lg border border-white/10">
          <code className="text-sm font-mono text-white px-1">
            {currentUser?.profile?.referral_code}
          </code>
          <button
            onClick={handleCopyReferral}
            className="p-1.5 hover:bg-white/10 rounded transition-colors text-neutral-300 hover:text-white"
          >
            {copied ? (
              <Check size={14} className="text-[#00af9b]" />
            ) : (
              <Copy size={14} />
            )}
          </button>
        </div>

        {!currentUser?.profile?.is_referred && (
          <div>
            <h4 className="text-xs text-neutral-400 font-medium mb-2 uppercase tracking-wide">
              Redeem Code
            </h4>
            <form onSubmit={handleRedeemReferral} className="flex gap-2 w-full">
              <input
                type="text"
                value={referralCodeInput}
                onChange={(e) => setReferralCodeInput(e.target.value)}
                placeholder="Enter code"
                className="flex-1 min-w-0 bg-[#1a1a1a]/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/25 placeholder-slate-500"
              />
              <Button
                type="submit"
                size="sm"
                disabled={isRedeeming || !referralCodeInput}
                className="bg-[#1a1a1a] text-white hover:bg-[#262626] shrink-0"
              >
                {isRedeeming ? "..." : "Go"}
              </Button>
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReferralSection;
