import { Button, Tooltip } from 'antd';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { Shortcut } from '@app/core';

import {
    Diagram,
    DiagramItem,
    DiagramItemSet,
    EditorStateInStore,
    getDiagram,
    getSelectedItems,
    pasteItems,
    removeItems,
    Serializer
} from '@app/wireframes/model';

import { SerializerContext } from '@app/context';

interface ClipboardMenuProps {
    // The selected diagram.
    selectedDiagram: Diagram | null;

    // The selected items.
    selectedItems: DiagramItem[];

    // Remove items.
    removeItems: (diagram: Diagram, items: DiagramItem[]) => any;

    // Ungroup items.
    pasteItems: (diagram: Diagram, json: string, offset?: number) => any;
}

interface ClipboardMenuState {
    clipboard?: string;

    offset: number;
}

const mapStateToProps = (state: EditorStateInStore) => {
    return {
        selectedDiagram: getDiagram(state),
        selectedItems: getSelectedItems(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
    removeItems, pasteItems
}, dispatch);

const OFFSET = 50;

class ClipboardMenu extends React.PureComponent<ClipboardMenuProps, ClipboardMenuState> {
    constructor(props: ClipboardMenuProps) {
        super(props);

        this.state = { offset: 0 };
    }

    private doCopy = (serializer: Serializer) => {
        const set =
            DiagramItemSet.createFromDiagram(
                this.props.selectedItems,
                this.props.selectedDiagram!);

        this.setState({ offset: 0, clipboard: serializer.serializeSet(set) });
    }

    private doCut = (serializer: Serializer) => {
        this.doCopy(serializer);

        this.props.removeItems(this.props.selectedDiagram!, this.props.selectedItems);
    }

    private doPaste = () => {
        this.setState(s => ({ offset: s.offset + OFFSET, clipboard: s.clipboard }));

        this.props.pasteItems(this.props.selectedDiagram!, this.state.clipboard!, this.state.offset);
    }

    public render() {
        const canCopy = this.props.selectedItems.length > 0;

        return (
            <SerializerContext.Consumer>
                {serializer =>
                <>
                    <Tooltip mouseEnterDelay={1} title='Copy items (CTRL + C)'>
                        <Button className='menu-item' size='large'
                            disabled={!canCopy}
                            onClick={() => this.doCopy(serializer)}>
                            <i className='icon-copy' />
                        </Button>
                    </Tooltip>

                    <Shortcut disabled={!canCopy} onPressed={() => this.doCopy(serializer)} keys='ctrl+c' />

                    <Tooltip mouseEnterDelay={1} title='Cut items (CTRL + X)'>
                        <Button className='menu-item' size='large'
                            disabled={!canCopy}
                            onClick={() => this.doCut(serializer)}>
                            <i className='icon-cut' />
                        </Button>
                    </Tooltip>

                    <Shortcut disabled={!canCopy} onPressed={() => this.doCut(serializer)} keys='ctrl+x' />

                    <Tooltip mouseEnterDelay={1} title='Paste items (CTRL + V)'>
                        <Button className='menu-item' size='large'
                            disabled={!this.state.clipboard}
                            onClick={this.doPaste}>
                            <i className='icon-paste' />
                        </Button>
                    </Tooltip>

                    <Shortcut disabled={!this.state.clipboard} onPressed={this.doPaste} keys='ctrl+v' />
                </>
                }
            </SerializerContext.Consumer>
        );
    }
}

export const ClipboardMenuContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(ClipboardMenu);