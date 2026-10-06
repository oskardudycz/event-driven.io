import styles from './Menu.module.css';
import React from 'react';
import PropTypes from 'prop-types';
import 'core-js/fn/array/from';

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
import { getOverflowedItems } from './overflow.mjs';
import config from '../../../content/meta/config';

class Menu extends React.Component {
  constructor(props) {
    super(props);
    this.itemList = React.createRef();

    const pages = props.pages.map((page) => ({
      to: page.node.fields.slug,
      label: page.node.frontmatter.menuTitle
        ? page.node.frontmatter.menuTitle
        : page.node.frontmatter.title,
      icon:
        page.node.frontmatter.icon === 'FaUserGraduate'
          ? FaUserGraduate
          : page.node.frontmatter.icon === 'FaHandshake'
            ? FaHandshake
            : undefined,
    }));

    this.items = [
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

    this.renderedItems = []; // will contain references to rendered DOM elements of menu
  }

  state = {
    open: false,
    hiddenItems: [],
  };

  static propTypes = {
    path: PropTypes.string.isRequired,
    fixed: PropTypes.bool.isRequired,
    screenWidth: PropTypes.number.isRequired,
    fontLoaded: PropTypes.bool.isRequired,
    pages: PropTypes.array.isRequired,
  };

  componentDidMount() {
    this.renderedItems = this.getRenderedItems();
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.path !== prevProps.path ||
      this.props.fixed !== prevProps.fixed ||
      this.props.screenWidth !== prevProps.screenWidth ||
      this.props.fontLoaded !== prevProps.fontLoaded
    ) {
      if (this.props.path !== prevProps.path) {
        this.closeMenu();
      }
      this.hideOverflowedMenuItems();
    }
  }

  getRenderedItems = () => {
    const itemList = this.itemList.current;
    return Array.from(itemList.children);
  };

  hideOverflowedMenuItems = () => {
    const PADDING_AND_SPACE_FOR_MORELINK = this.props.screenWidth >= 1024 ? 60 : 0;

    this.setState({
      hiddenItems: getOverflowedItems(
        this.itemList.current,
        this.renderedItems,
        PADDING_AND_SPACE_FOR_MORELINK,
      ),
    });
  };

  toggleMenu = (e) => {
    e.preventDefault();

    if (this.props.screenWidth < 1024) {
      this.renderedItems.forEach((item) => {
        const oldClass = this.state.open ? 'showItem' : 'hideItem';
        const newClass = this.state.open ? 'hideItem' : 'showItem';

        if (item.classList.contains(oldClass)) {
          item.classList.add(newClass);
          item.classList.remove(oldClass);
        }
      });
    }

    this.setState((prevState) => ({ open: !prevState.open }));
  };

  closeMenu = () => {
    if (this.state.open) {
      this.setState({ open: false });
      if (this.props.screenWidth < 1024) {
        this.renderedItems.forEach((item) => {
          if (item.classList.contains('showItem')) {
            item.classList.add('hideItem');
            item.classList.remove('item');
          }
        });
      }
    }
  };

  render() {
    const { screenWidth } = this.props;
    const { open } = this.state;

    return (
      <React.Fragment>
        <nav
          className={`menu ${styles['menu']} ${open ? `open ${styles['open']}` : ''}`}
          rel="js-menu"
        >
          <ul className={`itemList ${styles['itemList']}`} ref={this.itemList}>
            {this.items.map((item, i) => (
              <Item item={item} key={item.label ?? i} icon={item.icon} />
            ))}
          </ul>
          {this.state.hiddenItems.length > 0 && <Expand onClick={this.toggleMenu} />}
          {open && screenWidth >= 1024 && (
            <ul className={`hiddenItemList ${styles['hiddenItemList']}`}>
              {this.state.hiddenItems.map((item) => (
                <Item item={item} key={item.label} hiddenItem />
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
