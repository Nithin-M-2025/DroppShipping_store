import './index.css';

const TagItem = (props) => {
    const { tabDetails , onClick} = props;
    const { id , tabName } = tabDetails;

    return (
        <li>
            <button type="button" className = "tabbtn" onClick = {() => onClick(id)}>
                {tabName}
            </button>
        </li>
    );
};

export default TagItem;