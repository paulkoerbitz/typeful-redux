import * as React from 'react';
import { TodoItem } from '../reducers/Todo';

export interface TodoProps {
    item: TodoItem;
    toggle(): void;
    edit(task: string): void;
    delete(): void;
}

export interface TodoState {
    editedTask: string | undefined;
}

const ENTER_KEY_CODE = 13;

export class TodoComponent extends React.Component<TodoProps, TodoState> {
    constructor(p: TodoProps) {
        super(p);
        this.state = { editedTask: undefined };
    }
    private edit = () => {
        this.setState({ editedTask: this.props.item.task });
    }
    private handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const editedTask = e.target.value;
        this.setState({ editedTask });
    }
    private handleSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.keyCode === ENTER_KEY_CODE && this.state.editedTask != undefined) {
            this.props.edit(this.state.editedTask.trim());
            this.setState({ editedTask: undefined });
        }
    }
    render() {
        const { toggle, item } = this.props;
        const liClass =
            (item.completed ? "completed" : "") +
            (this.state.editedTask != undefined ? " editing" : "");

        return (
            <li className={liClass}>
                <div className="view">
                    <input
                        className="toggle"
                        type="checkbox"
                        checked={item.completed}
                        onClick={toggle}
                    />
                    <label onDoubleClick={this.edit}>{this.props.item.task}</label>
                    <button className="destroy" onClick={this.props.delete} />
                </div>
                <input
                    className="edit"
                    type="text"
                    value={this.state.editedTask}
                    onChange={this.handleChange}
                    onKeyDown={this.handleSubmit}
                    onBlur={() => this.setState({ editedTask: undefined })}
                />
            </li>
        );
    }
}
