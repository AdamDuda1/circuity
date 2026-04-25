import { Level } from './level-interface';
import { Globals } from '../../globals';
import { Switch } from '../../components/switch';

export class PianoLevel extends Level {
	name = 'Make a XOR!';
	descriptionHtml = 'Build a piano!';
	restrictComponentList = true;
	allowedComponents = ['Switch', 'Buzzer', 'XOR'];
	usedIO = ['c', 'd', 'e', 'f', 'g', 'a', 'b', 'c_note', 'd_note', 'e_note', 'f_note', 'g_note', 'a_note', 'b_note'];
	solution = "{\"components\":[{\"name\":\"Buzzer\",\"x\":-35,\"y\":65,\"inFrom\":[{\"component\":1,\"pin\":0},{\"component\":-1,\"pin\":-1}],\"custom\":{\"frequency\":329,\"volume\":0.2}},{\"name\":\"E4\",\"x\":-35,\"y\":15},{\"name\":\"F4\",\"x\":-10,\"y\":15},{\"name\":\"G4\",\"x\":15,\"y\":15},{\"name\":\"A4\",\"x\":40,\"y\":15},{\"name\":\"B4\",\"x\":65,\"y\":15},{\"name\":\"C4\",\"x\":-85,\"y\":15},{\"name\":\"D4\",\"x\":-60,\"y\":15},{\"name\":\"Buzzer\",\"x\":-60,\"y\":65,\"inFrom\":[{\"component\":8,\"pin\":0},{\"component\":-1,\"pin\":-1}],\"custom\":{\"frequency\":293,\"volume\":0.2}},{\"name\":\"Buzzer\",\"x\":-85,\"y\":65,\"inFrom\":[{\"component\":7,\"pin\":0},{\"component\":-1,\"pin\":-1}],\"custom\":{\"frequency\":261,\"volume\":0.2}},{\"name\":\"Buzzer\",\"x\":-10,\"y\":65,\"inFrom\":[{\"component\":2,\"pin\":0},{\"component\":-1,\"pin\":-1}],\"custom\":{\"frequency\":349,\"volume\":0.2}},{\"name\":\"Buzzer\",\"x\":15,\"y\":65,\"inFrom\":[{\"component\":3,\"pin\":0},{\"component\":-1,\"pin\":-1}],\"custom\":{\"frequency\":392,\"volume\":0.2}},{\"name\":\"Buzzer\",\"x\":40,\"y\":65,\"inFrom\":[{\"component\":4,\"pin\":0},{\"component\":-1,\"pin\":-1}]},{\"name\":\"Buzzer\",\"x\":65,\"y\":65,\"inFrom\":[{\"component\":5,\"pin\":0},{\"component\":-1,\"pin\":-1}],\"custom\":{\"frequency\":494,\"volume\":0.2}},{\"name\":\"C5\",\"x\":90,\"y\":15},{\"name\":\"Buzzer\",\"x\":90,\"y\":65,\"inFrom\":[{\"component\":17,\"pin\":0},{\"component\":-1,\"pin\":-1}],\"custom\":{\"frequency\":523,\"volume\":0.2}}],\"view\":{\"x\":-2.5,\"y\":40,\"z\":3.8968611673393845}}";

	verify(globals: Globals): boolean {


		return true;
	}
}

