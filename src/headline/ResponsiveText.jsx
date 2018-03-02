import React from 'react';
import PropTypes from 'prop-types';
import { debounce, isNumber } from 'lodash';

export default class ResponsiveText extends React.PureComponent {
    static propTypes = {
        tagName: PropTypes.string,
        tagClassName: PropTypes.string,
        windowResizeRefreshDelay: PropTypes.number,
        title: PropTypes.string,
        window: PropTypes.object,
        children: PropTypes.node
    };

    static defaultProps = {
        tagName: 'div',
        tagClassName: null,
        windowResizeRefreshDelay: 50,
        title: null,
        children: null,
        window
    };

    constructor(props) {
        super(props);

        this.state = {
            fontSize: null
        };

        this.resetFontSize = this.resetFontSize.bind(this);
        this.handleWindowResize = debounce(this.resetFontSize, this.props.windowResizeRefreshDelay);
    }

    componentDidMount() {
        const { window } = this.props;

        this.windowResizeListener = window.addEventListener('resize', this.handleWindowResize);

        this.adjustTextSize();
    }

    componentDidUpdate() {
        this.adjustTextSize();
    }

    componentWillUnmount() {
        const { window } = this.props;

        if (this.windowResizeListener) {
            this.windowResizeListener.cancel();
        }

        window.removeEventListener('resize', this.handleWindowResize);
    }

    resetFontSize() {
        this.setState({
            fontSize: null
        });
    }

    adjustTextSize() {
        const currentStyle = this.props.window.getComputedStyle(this.container, null);
        const currentFontSize = parseFloat(currentStyle.fontSize);

        if (!this.state.fontSize && isNumber(currentFontSize)) {
            const { scrollWidth } = this.container;
            const { width } = this.container.getBoundingClientRect();

            const ratio = width / scrollWidth;
            const size = Math.floor(currentFontSize * ratio);

            this.setState({
                fontSize: `${size}px`
            });
        }
    }

    render() {
        const { tagClassName, title, children } = this.props;
        const { fontSize } = this.state;

        return (
            <this.props.tagName
                className={tagClassName}
                ref={(ref) => { this.container = ref; }}
                style={{ fontSize }}
                title={title}
            >
                {children}
            </this.props.tagName>
        );
    }
}
