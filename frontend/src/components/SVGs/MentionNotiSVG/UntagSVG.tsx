import { SVGProps } from "../../../utils/GlobalInterface";

export default function UntagSVG(props: SVGProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      height={props.height}
      width={props.width}
    >
      <g>
        <path
          fill={props.color ? props.color : "#000"}
          d="M20.29 2.293L18.5 4.081C16.73 2.625 14.47 1.75 12 1.75 6.33 1.75 1.75 6.339 1.75 12c0 2.471.87 4.739 2.33 6.509l-1.79 1.784 1.42 1.414 18-18-1.42-1.414zM9.21 13.377c-.2-.498-.28-1.086-.19-1.725.25-1.769 1.65-2.798 2.89-2.623.41.057.79.242 1.12.525l-3.82 3.823zm5.24-5.245c-.6-.567-1.37-.958-2.26-1.083-2.58-.363-4.79 1.719-5.15 4.325-.18 1.243.08 2.487.68 3.487L5.5 17.086C4.4 15.685 3.75 13.919 3.75 12c0-4.556 3.69-8.25 8.25-8.25 1.91 0 3.68.655 5.08 1.754l-2.63 2.628zM7.2 21.06l1.49-1.497c1.02.442 2.13.687 3.31.687 1.59 0 3.08-.451 4.34-1.233l1.05 1.7c-1.57.972-3.42 1.533-5.39 1.533-1.74 0-3.37-.43-4.8-1.19zm4.07-4.069l4.72-4.722-.03.321c.03 1.145.92 2.122 2.1 2.23.91.083 1.62-.357 1.84-.99.2-.585.35-1.224.35-1.83 0-1.174-.25-2.29-.69-3.301l1.5-1.497c.76 1.432 1.19 3.065 1.19 4.798 0 .901-.21 1.77-.46 2.477-.59 1.731-2.34 2.478-3.91 2.334-1.24-.112-2.29-.729-3-1.626-.87 1.125-2.16 1.847-3.61 1.806z"
        ></path>
      </g>
    </svg>
  );
}
