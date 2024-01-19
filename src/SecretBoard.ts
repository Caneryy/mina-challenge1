
import {
    DeployArgs, Permissions, Bool, Mina, PrivateKey, Field, SmartContract, state, State, method, MerkleMap, PublicKey, CircuitString, MerkleMapWitness, Poseidon
} from 'o1js';

export class SecretBoard extends SmartContract {

    @state(Field) merkleMapRoot = State<Field>();
    @state(PublicKey) admin = State<PublicKey>();
    @state(Field) addressCount = State<Field>();
    @state(Field) messageCount = State<Field>();

    deploy(deployArgs?: DeployArgs) {
        super.deploy(deployArgs)
        this.account.permissions.set({
            ...Permissions.allImpossible(),
            access: Permissions.proof(),
            editState: Permissions.proof()
        })
    }

    init() {
        super.init()

        const map = new MerkleMap();
        this.merkleMapRoot.set(map.getRoot())
        this.admin.set(this.sender)
        this.addressCount.set(new Field(0));
        this.messageCount.set(new Field(0));
    }

    @method storeAddress(keyWitness: MerkleMapWitness, valueBefore: Field, publicKey: PublicKey) {
        const merkleMapRoot = this.merkleMapRoot.getAndRequireEquals()

        const [rootBefore, key] = keyWitness.computeRootAndKey(valueBefore);
        rootBefore.assertEquals(merkleMapRoot);


        const map = new MerkleMap();
        map.set(Poseidon.hash(publicKey.toFields()), Field(0))
        this.merkleMapRoot.set(map.getRoot())
    }

    @method storeMessage(keyWitness: MerkleMapWitness, valueBefore: Field, message: Field) {
        const merkleMapRoot = this.merkleMapRoot.getAndRequireEquals();

        const [rootBefore, key] = keyWitness.computeRootAndKey(valueBefore);
        rootBefore.assertEquals(merkleMapRoot);

        key.assertEquals(Poseidon.hash(this.sender.toFields()));

    }
}
