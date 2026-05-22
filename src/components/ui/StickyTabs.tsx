import React, { Children, isValidElement } from "react";
import clsx from "clsx";

// ─── StickyTabItem ────────────────────────────────────────────────────────────

export interface StickyTabItemProps {
  title: string;
  id: string | number;
  children: React.ReactNode;
}

const StickyTabItem: React.FC<StickyTabItemProps> = () => null;

// ─── StickyTabs ───────────────────────────────────────────────────────────────

interface StickyTabsProps {
  children: React.ReactNode;
  /** Should match the height of your fixed top nav. Default: 3.5rem (h-14). */
  mainNavHeight?: string;
  rootClassName?: string;
  navSpacerClassName?: string;
  sectionClassName?: string;
  stickyHeaderContainerClassName?: string;
  headerContentWrapperClassName?: string;
  headerContentLayoutClassName?: string;
  titleClassName?: string;
  contentLayoutClassName?: string;
}

const StickyTabs: React.FC<StickyTabsProps> & { Item: React.FC<StickyTabItemProps> } = ({
  children,
  mainNavHeight = "3.5rem",
  rootClassName = "bg-background text-foreground",
  navSpacerClassName = "border-b border-border bg-background",
  sectionClassName = "bg-muted/30",
  stickyHeaderContainerClassName = "shadow-sm",
  headerContentWrapperClassName = "border-b border-t border-border bg-background",
  headerContentLayoutClassName = "mx-auto max-w-6xl px-4 md:px-6 py-4",
  titleClassName = "font-display font-bold text-xl md:text-2xl leading-none my-0",
  contentLayoutClassName = "mx-auto max-w-6xl px-4 md:px-6 py-12 md:py-20",
}) => {
  const stickyTop = `calc(${mainNavHeight} - 1px)`;

  return (
    <div className={clsx("overflow-x-clip", rootClassName)}>
      {Children.map(children, (child) => {
        if (!isValidElement(child) || child.type !== StickyTabItem) {
          if (process.env.NODE_ENV === "development" && child != null) {
            console.warn("StickyTabs: direct children must be <StickyTabs.Item>.");
          }
          return null;
        }

        const item = child as React.ReactElement<StickyTabItemProps>;
        const { title, id, children: content } = item.props;

        return (
          <section
            key={id}
            id={String(id)}
            className={clsx("relative overflow-x-clip", sectionClassName)}
          >
            {/* Sticky section title */}
            <div
              className={clsx("sticky z-40 -mt-px flex flex-col", stickyHeaderContainerClassName)}
              style={{ top: stickyTop }}
            >
              <div className={clsx(headerContentWrapperClassName)}>
                <div className={clsx(headerContentLayoutClassName)}>
                  <h2 className={clsx(titleClassName)}>{title}</h2>
                </div>
              </div>
            </div>

            {/* Section content */}
            <div className={clsx(contentLayoutClassName)}>{content}</div>
          </section>
        );
      })}
    </div>
  );
};

StickyTabs.Item = StickyTabItem;

export default StickyTabs;
