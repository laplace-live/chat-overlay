import type { ComponentProps } from 'react'

import { cn } from '../../lib/cn'

export type LoadingProps = {
  size?: string
} & ComponentProps<'span'>

export function Loading({ size, className, ...props }: LoadingProps) {
  return (
    <span
      data-slot='loading'
      className={cn('inline-flex align-[-0.25em]', className)}
      style={{
        width: `${size || '1.25em'}`,
        height: `${size || '1.25em'}`,
      }}
      {...props}
    >
      {/* svg copied and modified from logo.svg in laplace project */}
      <svg
        className='animate-[spin_2s_linear_infinite]'
        fill='none'
        viewBox='0 0 1200 1200'
        xmlns='http://www.w3.org/2000/svg'
      >
        <title>Loading</title>
        <style>{`
          .petal {
            opacity: 0;
            transform-origin: center;
            animation: bloom-loading 0.4s ease-out forwards;
            will-change: transform, opacity;
          }

          .petal.small {
            animation-delay: 0.1s;
          }

          .petal.p1 { animation-delay: 0s; }
          .petal.p2 { animation-delay: 0.1s; }
          .petal.p3 { animation-delay: 0.2s; }
          .petal.p4 { animation-delay: 0.3s; }
          .petal.p5 { animation-delay: 0.4s; }
          .petal.p6 { animation-delay: 0.5s; }

          @keyframes bloom-loading {
            0% {
              opacity: 0;
              transform: scale(0);
            }
            60% {
              opacity: 1;
              transform: scale(1.1);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}</style>

        <path
          className='petal p1'
          d='M600.206 576.882C666.728 508.595 707.706 415.303 707.706 312.441C707.706 209.578 666.728 116.287 600.206 48C533.684 116.287 492.706 209.578 492.706 312.441C492.706 415.303 533.684 508.595 600.206 576.882Z'
          fill='url(#paint0_linear_4759_4490)'
        />
        <path
          className='petal p1 small'
          d='M600.206 576.725C570.285 546.01 551.854 504.049 551.854 457.783C551.854 411.517 570.285 369.556 600.206 338.842C630.126 369.556 648.557 411.517 648.557 457.783C648.557 504.049 630.126 546.01 600.206 576.725Z'
          fill='url(#paint1_linear_4759_4490)'
        />
        <path
          className='petal p2 alt'
          d='M620.232 589.477C712.63 612.943 813.912 601.786 902.994 550.354C992.076 498.923 1052.38 416.789 1078.26 325.036C985.857 301.57 884.576 312.728 795.494 364.159C706.412 415.59 646.108 497.724 620.232 589.477Z'
          fill='url(#paint2_linear_4759_4490)'
        />
        <path
          className='petal p3'
          d='M620.637 612.657C646.514 704.41 706.818 786.544 795.9 837.975C884.981 889.406 986.263 900.564 1078.66 877.098C1052.79 785.345 992.481 703.211 903.4 651.78C814.318 600.348 713.036 589.191 620.637 612.657Z'
          fill='url(#paint3_linear_4759_4490)'
        />
        <path
          className='petal p3 small'
          d='M620.773 612.735C662.333 602.18 707.888 607.199 747.955 630.332C788.023 653.465 815.147 690.407 826.786 731.676C785.226 742.231 739.671 737.212 699.604 714.079C659.536 690.946 632.412 654.004 620.773 612.735Z'
          fill='url(#paint4_linear_4759_4490)'
        />
        <path
          className='petal p4 alt'
          d='M600.127 623.206C533.606 691.493 492.627 784.785 492.627 887.647C492.627 990.51 533.606 1083.8 600.127 1152.09C666.649 1083.8 707.627 990.51 707.627 887.647C707.627 784.785 666.649 691.493 600.127 623.206Z'
          fill='url(#paint5_linear_4759_4490)'
        />
        <path
          className='petal p5'
          d='M579.775 612.098C487.376 588.632 386.094 599.79 297.012 651.221C207.931 702.652 147.627 784.786 121.75 876.539C214.149 900.005 315.431 888.848 404.512 837.416C493.594 785.985 553.898 703.851 579.775 612.098Z'
          fill='url(#paint6_linear_4759_4490)'
        />
        <path
          className='petal p5 alt'
          d='M579.639 612.178C568 653.447 540.876 690.389 500.809 713.522C460.741 736.655 415.186 741.674 373.627 731.119C385.266 689.85 412.39 652.907 452.457 629.774C492.525 606.641 538.08 601.623 579.639 612.178Z'
          fill='url(#paint7_linear_4759_4490)'
        />
        <path
          className='petal p6 alt'
          d='M580.181 588.538C554.304 496.785 494 414.652 404.918 363.22C315.837 311.789 214.555 300.631 122.156 324.098C148.033 415.851 208.337 497.984 297.418 549.416C386.5 600.847 487.782 612.005 580.181 588.538Z'
          fill='url(#paint8_linear_4759_4490)'
        />
        <defs>
          <linearGradient
            id='paint0_linear_4759_4490'
            x1='600.206'
            y1='48'
            x2='600.206'
            y2='576.881'
            gradientUnits='userSpaceOnUse'
          >
            <stop stopColor='var(--color-fg)' />
            <stop offset='0.447917' stopColor='var(--color-fg)' stopOpacity='0.7' />
            <stop offset='1' stopColor='var(--color-fg)' stopOpacity='0.4' />
          </linearGradient>
          <linearGradient
            id='paint1_linear_4759_4490'
            x1='600.206'
            y1='338.842'
            x2='600.206'
            y2='576.724'
            gradientUnits='userSpaceOnUse'
          >
            <stop stopColor='var(--color-bg)' />
            <stop offset='1' stopColor='var(--color-bg)' stopOpacity='0' />
          </linearGradient>
          <linearGradient
            id='paint2_linear_4759_4490'
            x1='1078.26'
            y1='325.036'
            x2='620.232'
            y2='589.477'
            gradientUnits='userSpaceOnUse'
          >
            <stop stopColor='var(--color-ac)' />
            <stop offset='0.510417' stopColor='var(--color-ac)' stopOpacity='0.7' />
            <stop offset='1' stopColor='var(--color-ac)' stopOpacity='0.2' />
          </linearGradient>
          <linearGradient
            id='paint3_linear_4759_4490'
            x1='1078.66'
            y1='877.098'
            x2='620.637'
            y2='612.657'
            gradientUnits='userSpaceOnUse'
          >
            <stop stopColor='var(--color-fg)' />
            <stop offset='0.447917' stopColor='var(--color-fg)' stopOpacity='0.7' />
            <stop offset='1' stopColor='var(--color-fg)' stopOpacity='0.4' />
          </linearGradient>
          <linearGradient
            id='paint4_linear_4759_4490'
            x1='826.786'
            y1='731.676'
            x2='620.773'
            y2='612.735'
            gradientUnits='userSpaceOnUse'
          >
            <stop stopColor='var(--color-bg)' />
            <stop offset='1' stopColor='var(--color-bg)' stopOpacity='0' />
          </linearGradient>
          <linearGradient
            id='paint5_linear_4759_4490'
            x1='600.127'
            y1='1152.09'
            x2='600.127'
            y2='623.206'
            gradientUnits='userSpaceOnUse'
          >
            <stop stopColor='var(--color-ac)' />
            <stop offset='0.510417' stopColor='var(--color-ac)' stopOpacity='0.7' />
            <stop offset='1' stopColor='var(--color-ac)' stopOpacity='0.2' />
          </linearGradient>
          <linearGradient
            id='paint6_linear_4759_4490'
            x1='121.75'
            y1='876.539'
            x2='579.775'
            y2='612.098'
            gradientUnits='userSpaceOnUse'
          >
            <stop stopColor='var(--color-fg)' />
            <stop offset='0.447917' stopColor='var(--color-fg)' stopOpacity='0.7' />
            <stop offset='1' stopColor='var(--color-fg)' stopOpacity='0.4' />
          </linearGradient>
          <linearGradient
            id='paint7_linear_4759_4490'
            x1='373.627'
            y1='731.119'
            x2='579.639'
            y2='612.178'
            gradientUnits='userSpaceOnUse'
          >
            <stop stopColor='var(--color-bg)' />
            <stop offset='1' stopColor='var(--color-bg)' stopOpacity='0' />
          </linearGradient>
          <linearGradient
            id='paint8_linear_4759_4490'
            x1='122.156'
            y1='324.098'
            x2='580.181'
            y2='588.538'
            gradientUnits='userSpaceOnUse'
          >
            <stop stopColor='var(--color-ac)' />
            <stop offset='0.510417' stopColor='var(--color-ac)' stopOpacity='0.7' />
            <stop offset='1' stopColor='var(--color-ac)' stopOpacity='0.2' />
          </linearGradient>
        </defs>
      </svg>
    </span>
  )
}

export default Loading
