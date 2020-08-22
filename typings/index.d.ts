import { Canvas } from 'canvas';
declare module 'text2png' {
	type Params = {
		font?: string;
		textAlign?: string;
		color?: string;
		backgroundColor?: string;
		lineSpacing?: number;
		strokeWidth?: number;
		strokeColor?: string;
		padding?: number;
		borderWidth?: number;
		borderColor?: string;
		output?: 'buffer' | 'stream' | 'dataURL' | 'canvas';
	};
	interface ICanvas {
		(title: string, options?: Params): Buffer | string | Canvas;
	}
	const Canvas: ICanvas;
	export default Canvas;
}
