import { Level } from './level-interface';
import { Globals } from '../../globals';
import { Switch } from '../../components/switch';
import { Buzzer } from '../../components/buzzer';

export class PianoLevel extends Level {
	name = 'Make a piano!';
	static readonly NOTES: Record<string, number> = {
		'C4': 261,
		'D4': 293,
		'E4': 329,
		'F4': 349,
		'G4': 392,
		'A4': 440,
		'B4': 493,
		'C5': 523,
	};

	readonly notesArray = Object.entries(PianoLevel.NOTES).map(([note, freq]) => ({ note, freq }));

	descriptionHtml = 'Build a simple electrical piano from buttons and buzzers! Every button with the name of the note (and ideally type>hold) should power a buzzer with the frequency of the note (<b>the exact number!</b>).<br><br>' +
		'The notes are:<br>C4 - 261 Hz<br>D4 - 293 Hz<br>E4 - 329 Hz<br>F4 - 349 Hz<br>G4 - 392 Hz<br>A4 - 440 Hz<br>B4 - 493 Hz<br>C5 - 523 Hz<br><br>Fun fact: if you would like to expand your piano, the formula for note frequency is f = 440 * 2^((n-49)/12), where n is the number of the note (so A4 is 49, A#4 is 50, B4 is 51, C5 is 52 and so on).';
	restrictComponentList = true;
	allowedComponents = ['Switch', 'Buzzer'];
	usedIO = ['c', 'd', 'e', 'f', 'g', 'a', 'b', 'c_note', 'd_note', 'e_note', 'f_note', 'g_note', 'a_note', 'b_note'];
	solution = "{\"components\":[{\"type\":\"Buzzer\",\"x\":-35,\"y\":15,\"inFrom\":[{\"component\":15,\"pin\":0},{\"component\":-1,\"pin\":-1}],\"custom\":{\"frequency\":293,\"volume\":0.2}},{\"type\":\"Buzzer\",\"x\":-10,\"y\":15,\"inFrom\":[{\"component\":7,\"pin\":0},{\"component\":-1,\"pin\":-1}],\"custom\":{\"frequency\":329,\"volume\":0.2}},{\"type\":\"Buzzer\",\"x\":15,\"y\":15,\"inFrom\":[{\"component\":8,\"pin\":0},{\"component\":-1,\"pin\":-1}],\"custom\":{\"frequency\":349,\"volume\":0.2}},{\"type\":\"Buzzer\",\"x\":40,\"y\":15,\"inFrom\":[{\"component\":9,\"pin\":0},{\"component\":-1,\"pin\":-1}],\"custom\":{\"frequency\":392,\"volume\":0.2}},{\"type\":\"Buzzer\",\"x\":65,\"y\":15,\"inFrom\":[{\"component\":10,\"pin\":0},{\"component\":-1,\"pin\":-1}]},{\"type\":\"Buzzer\",\"x\":-60,\"y\":15,\"inFrom\":[{\"component\":6,\"pin\":0},{\"component\":-1,\"pin\":-1}],\"custom\":{\"frequency\":261,\"volume\":0.2}},{\"type\":\"Switch\",\"x\":-60,\"y\":-10,\"label\":\"c4\",\"showLabel\":true,\"outTo\":[[{\"component\":9,\"pin\":0},{\"component\":5,\"pin\":0}],[]],\"custom\":{\"mode\":\"button\",\"buttonReleaseDelayMs\":0}},{\"type\":\"Switch\",\"x\":-10,\"y\":-10,\"label\":\"e4\",\"showLabel\":true,\"outTo\":[[{\"component\":6,\"pin\":0},{\"component\":1,\"pin\":0}],[]],\"custom\":{\"mode\":\"button\",\"buttonReleaseDelayMs\":0}},{\"type\":\"Switch\",\"x\":15,\"y\":-10,\"label\":\"f4\",\"showLabel\":true,\"outTo\":[[{\"component\":2,\"pin\":0}],[]],\"custom\":{\"mode\":\"button\",\"buttonReleaseDelayMs\":0}},{\"type\":\"Switch\",\"x\":40,\"y\":-10,\"label\":\"g4\",\"showLabel\":true,\"outTo\":[[{\"component\":7,\"pin\":0},{\"component\":3,\"pin\":0}],[]],\"custom\":{\"mode\":\"button\",\"buttonReleaseDelayMs\":0}},{\"type\":\"Switch\",\"x\":65,\"y\":-10,\"label\":\"a4\",\"showLabel\":true,\"outTo\":[[{\"component\":8,\"pin\":0},{\"component\":4,\"pin\":0}],[]],\"custom\":{\"mode\":\"button\",\"buttonReleaseDelayMs\":0}},{\"type\":\"Switch\",\"x\":90,\"y\":-10,\"label\":\"b4\",\"showLabel\":true,\"outTo\":[[{\"component\":12,\"pin\":0}],[]],\"custom\":{\"mode\":\"button\",\"buttonReleaseDelayMs\":0}},{\"type\":\"Buzzer\",\"x\":90,\"y\":15,\"inFrom\":[{\"component\":11,\"pin\":0},{\"component\":-1,\"pin\":-1}],\"custom\":{\"frequency\":493,\"volume\":0.2}},{\"type\":\"Switch\",\"x\":115,\"y\":-10,\"label\":\"c5\",\"showLabel\":true,\"outTo\":[[{\"component\":14,\"pin\":0}],[]],\"custom\":{\"mode\":\"button\",\"buttonReleaseDelayMs\":0}},{\"type\":\"Buzzer\",\"x\":115,\"y\":15,\"inFrom\":[{\"component\":13,\"pin\":0},{\"component\":-1,\"pin\":-1}],\"custom\":{\"frequency\":523,\"volume\":0.2}},{\"type\":\"Switch\",\"x\":-35,\"y\":-10,\"label\":\"d4\",\"showLabel\":true,\"outTo\":[[{\"component\":0,\"pin\":0}],[]],\"custom\":{\"mode\":\"button\",\"buttonReleaseDelayMs\":0}}],\"view\":{\"x\":0,\"y\":0,\"z\":2}}";

	verify(globals: Globals) {
		for (const { note, freq } of this.notesArray) {
			const s = globals.simulation.circuitComponents().find(c => !c.deleted && c.getDisplayLabel().trim().toLowerCase() === note.toLowerCase()) as Switch;
			const b = globals.simulation.circuitComponents().find(c => !c.deleted && (c as Buzzer).frequency === freq) as Buzzer;
			if (!s || !b || !b.inStates[0]) return false;
		}
		return true;
	}
}

