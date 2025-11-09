"use client";

import type { FC } from "react";

import { Button } from "@/components/ui/button";

type Props = {
  isSubmitting: boolean;
  formError: string | null;
  formSuccess: string | null;
  onCancel: () => void;
};

const FooterActionsBar: FC<Props> = ({
  isSubmitting,
  formError,
  formSuccess,
  onCancel,
}) => {
  return (
    <div className="sticky bottom-0 z-10 border-t border-slate-200/80 bg-linear-to-t from-white/95 to-white/80 backdrop-blur py-3">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-1">
        <div className="flex flex-col text-xs text-muted-foreground">
          {formError && (
            <p className="text-destructive font-medium">{formError}</p>
          )}
          {formSuccess && (
            <p className="text-emerald-600 font-medium">{formSuccess}</p>
          )}
          {!formError && !formSuccess && (
            <p>
              You can save this product as{" "}
              <span className="font-semibold">Draft</span> and publish later.
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            className="border-slate-300 text-slate-600 hover:bg-slate-100"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-pcolor text-white hover:bg-pcolor/90 px-5"
          >
            {isSubmitting ? "Saving…" : "Save product"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FooterActionsBar;
