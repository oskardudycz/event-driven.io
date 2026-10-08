import styles from './Menu.module.css';
import React from 'react';
import PropTypes from 'prop-types';

import {
  FaBookOpen,
  FaGithub,
  FaHome,
  FaLinkedin,
  FaMicrophone,
  FaRss,
  FaMastodon,
  FaYoutube,
  FaUserGraduate,
  FaHandshake,
} from 'react-icons/fa/';
import { FaSearch } from 'react-icons/fa/';
import { FaEnvelope } from 'react-icons/fa/';
import { FaTag } from 'react-icons/fa/';
import LanguagePicker from '../LanguagePicker';

import Item from './Item';
import BlueskyIcon from './BlueskyIcon';
import Expand from './Expand';
import { getOverflowedIndexes } from './overflow.mjs';
import config from '../../../content/meta/config';

class Menu extends React.Component {
  itemList = React.createRef();

  state = { open: false, hiddenIndexes: [], measuring: false };

  // Gatsby preserves the layout during navigation. Read the current localized
  // page models rather than retaining a copy of the first page's props.
  get items() {
    const pages = this.props.pages.map((page) => ({
      to: page.node.fields.slug,
      label: page.node.frontmatter.menuTitle || page.node.frontmatter.title,
      icon:
        page.node.frontmatter.icon === 'FaUserGraduate'
          ? FaUserGraduate
          : page.node.frontmatter.icon === 'FaHandshake'
            ? FaHandshake
            : undefined,
    }));
    return [
      { to: '/', label: 'Start', icon: FaHome },
      { to: '/articles/', label: 'menu.articles', icon: FaBookOpen },
      { to: '/category/', label: 'menu.categories', icon: FaTag },
      ...pages,
      { to: '/contact/', label: 'menu.contact', icon: FaEnvelope },
      { to: '/talks/', label: 'menu.talks', icon: FaMicrophone },
      { to: '/search/', icon: FaSearch },
      { to: config.socialLinks.linkedin.url, icon: FaLinkedin },
      { to: config.socialLinks.github.url, icon: FaGithub },
      { to: config.socialLinks.mastodon.url, icon: FaMastodon },
      { to: config.socialLinks.bluesky.url, icon: BlueskyIcon },
      { to: config.socialLinks.youtube.url, icon: FaYoutube },
      { to: config.socialLinks.rss.url, icon: FaRss },
    ];
  }

  static propTypes = {
    path: PropTypes.string.isRequired,
    fixed: PropTypes.bool.isRequired,
    screenWidth: PropTypes.number.isRequired,
    fontLoaded: PropTypes.bool.isRequired,
    pages: PropTypes.array.isRequired,
  };

  componentDidMount() {
    if (this.props.screenWidth > 0) this.measureOverflow();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.props.path !== prevProps.path ||
      this.props.fixed !== prevProps.fixed ||
      this.props.screenWidth !== prevProps.screenWidth ||
      this.props.fontLoaded !== prevProps.fontLoaded ||
      this.props.pages !== prevProps.pages
    ) {
      // Reveal items through React for one measurement render. Lifecycle updates
      // finish before paint; refs only read dimensions, never mutate child DOM.
      this.setState({
        hiddenIndexes: [],
        measuring: true,
        open: this.props.path !== prevProps.path ? false : this.state.open,
      });
    } else if (this.state.measuring && !prevState.measuring) {
      this.measureOverflow();
    }
  }

  measureOverflow = () => {
    const list = this.itemList.current;
    const reservedWidth = this.props.screenWidth >= 1024 ? 60 : 0;
    const widths = Array.from(list.children, (item) => item.offsetWidth);
    this.setState({
      hiddenIndexes: getOverflowedIndexes(widths, list.offsetWidth - reservedWidth),
      measuring: false,
    });
  };

  toggleMenu = () => {
    this.setState((prevState) => ({ open: !prevState.open }));
  };

  render() {
    const { screenWidth } = this.props;
    const { open, hiddenIndexes } = this.state;
    const items = this.items;

    return (
      <React.Fragment>
        <nav
          className={`menu ${styles['menu']} ${open ? `open ${styles['open']}` : ''}`}
          rel="js-menu"
        >
          <ul className={`itemList ${styles['itemList']}`} ref={this.itemList}>
            {items.map((item, i) => (
              <Item
                item={item}
                key={item.to || i}
                overflowHidden={hiddenIndexes.includes(i) && !(open && screenWidth < 1024)}
              />
            ))}
          </ul>
          {hiddenIndexes.length > 0 && <Expand onClick={this.toggleMenu} open={open} />}
          {open && screenWidth >= 1024 && (
            <ul className={`hiddenItemList ${styles['hiddenItemList']}`}>
              {hiddenIndexes.map((index) => (
                <Item item={items[index]} key={items[index].to} hiddenItem />
              ))}
            </ul>
          )}

          <LanguagePicker />
        </nav>
      </React.Fragment>
    );
  }
}

export default Menu;
