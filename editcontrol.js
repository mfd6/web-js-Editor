function getParent( node, ancetor ){
			//if ( node === ancetor ) return node;
			if ( node.parentElement === ancetor ) return node;
			if ( node === this.div ) return false;
			if ( node === document.body ) return false;
			return getParent( node.parentElement, ancetor );
		}
		function removeNodesFromChilds( node, nodeName, at, until, startElem, stopElem ){
			at = at >= 0 ? at :  0;
			until = until >= 0 ? until : node.childNodes.length;
			if (startElem != null) {
				for ( let i = at ; i < until ; ++i )
				{
					if (startElem === node.childNodes[i]) {
						at = i;
						break;
					}
				}
			}
			if (stopElem != null) {
				for ( let i = at ; i < until ; ++i )
				{
					if (stopElem === node.childNodes[i]) {
						until = i;
						break;
					}
				}
			}
			let tb = [];
			for ( let i = at ; i < until ; ++i )
			{
				if ( node.childNodes[i].type === Node.ELEMENT_NODE ){
					tb[i] = node.childNodes[i];
				}
			}
			for ( let i = 0 ; i < tb.length ; i++ )
			{
				const chldNode = tb[i];
				if ( chldNode.nodeName === nodeName )
				{
					while ( chldNode.childNodes.length > 0 )
					{
						node.insertBefore( chldNode.firstChild , chldNode );
					}
					node.removeChild( chldNode );
				}
				else{
					removeNodesFromChilds( chldNode, nodeName )
				}
			}
		}
		function removeNode( node ) {
			let parent = node.parentElement;
			while ( node.childNodes.length > 0 )
			{
				parent.insertBefore( node.firstChild , node );
			}
			parent.removeChild( node );
		}
		function removeNodes( node ) {
			let parent = node.parentElement;
			while ( node.childNodes.length > 0 )
			{
				parent.insertBefore( node.firstChild , node );
			}
			parent.removeChild( node );
		}

		this.div = document.getElementById( 'DivId' );
		function isInside( node, nodeName ){
			if ( node === this.div ) return false;
			if ( node === document.body ) return false;
			if ( node.nodeName === nodeName ) return node;
			
			return this.isInside( node.parentElement , nodeName );
		}
		function isInsideCode( node ){
			if ( node === this.div ) return false;
			if ( node === document.body ) return false;

			if ( node.nodeName === "CODE" ) return true;

			return isInsideCode( node.parentElement );
		}

		function isChildOfDiv( node, div ){
			if ( node === div ) return true;
			if ( node === document.body ) return false;
			return isChildOfDiv( node.parentElement );
		}
		function hideEmptyLinePanel(){
			emptyLinePanel.style.display = "none";
		}		
		function startCont2Parent(range, parent, nodeName) {
			let r = document.createRange();
			r.selectNodeContents(range.startContainer);
			r.setStart(range.startContainer, range.startOffset);
			if (!r.isCollapsed) {
				let pc = range.startContainer.parentNode;
				let newNode1 = document.createElement(nodeName);
				r.surroundContents(newNode1);
				removeNodesFromChilds(newNode1, nodeName);				
				if (range.startContainer === parent || pc === parent)	return;
				pc = pc.parentNode;
				while (true) {
					r.selectNodeContents(pc);
					r.setStartAfter(newNode1);
					if (!r.isCollapsed) {
						const nN = document.createElement(nodeName);
						r.surroundContents(nN);
							removeNodesFromChilds(newNode1, nodeName);	
					}	
					if (pc === parent) return;
					pc = pc.parentNode;	
				}
			}
		}
		function endCont2Parent(range, parent, nodeName) {
			let r = document.createRange();			
			r.selectNodeContents(range.endContainer);
			r.setEnd(range.endContainer, range.endOffset);
			if (!r.isCollapsed) {	
				let pc = range.endContainer.parentNode;			
				let newNode1 = document.createElement(nodeName);
				r.surroundContents(newNode1);
				removeNodesFromChilds(newNode1, nodeName);	
				if (range.endContainer === parent || pc === parent)	return;
				pc = pc.parentNode;
				while (true) {					
					r.selectNodeContents(pc);
					r.setEndBefore(newNode1);
					if (!r.isCollapsed) {
						const nN = document.createElement(nodeName);
						r.surroundContents(nN);	
						removeNodesFromChilds(newNode1, nN);	
					}					
					if (pc === parent) return;
					pc = pc.parentNode;	
				}
			}
		}

		function endRemoveCont2Parent(range, parent, nodeName) {
			let pc = range.endContainer.parentNode;	
			let ret = false;
			let endNode = range.endContainer;
			if (range.endContainer === parent || pc === parent)	ret = true;
			if( endNode.nodeType === Node.ELEMENT_NODE ){
				if (endNode.nodeName === nodeName) {
					const pr = endNode.parentElement;
					for (let i = 0; i < range.endOffset; i++) {
						pc.insertBefore(endNode.firstChild);			
					}
				} 
				removeNodesFromChilds(range.endContainer, nodeName, 0, range.endOffset);				
			}
			if(ret) return;

			removeNodesFromChilds(pc, nodeName, 0, -1, null, endNode);
			removeNode(endNode);
			endNode = pc;
			
			pc = pc.parentNode;
			while (true) {					
				removeNodesFromChilds(pc, nodeName, 0, -1, null, pc );					
				if (pc === parent) return;
				pc = pc.parentNode;	
			}
		}

		function removeFormat(range, nodeName, startContainerNode) {
			const p = getParent(range.startContainer, startContainerNode);

			let r = document.createRange();
			r.selectNodeContents(range.startContainer.parentNode);
			r.setStart(range.endContainer, range.endOffset);
			if (!r.isCollapsed) {
				const newNode1 = document.createElement(nodeName);
				r.surroundContents(newNode1);
			}
			
			r.selectNodeContents(range.startContainer.parentNode);
			r.setEnd(range.startContainer, range.startOffset);
			if (!r.isCollapsed) {
				const newNode2 = document.createElement(nodeName);
				r.surroundContents(newNode2);
			}
			
			r.setStartBefore(startContainerNode);
			r.setEndBefore(p);
			startContainerNode.removeChild(p);
			let k = r.extractContents();

			r.insertNode(p);
			r.insertNode(k);					
		}
		function formatWith(range, nodeName) {
			const startContainerNode = isInside( range.startContainer , nodeName );
			const endContainerNode = isInside( range.endContainer , nodeName );	
			if (startContainerNode!==false) range.setStartBefore(startContainerNode);
			if (endContainerNode!==false) 	range.setEndAfter(endContainerNode);
			const sp = getParent(range.startContainer, range.commonAncestorContainer);
			const ep = getParent(range.endContainer, range.commonAncestorContainer);

			if ( startContainerNode !== false || endContainerNode !== false )
			{
				let r = document.createRange();	
				r.setStartAfter(startContainerNode);
				r.setEndBefore(endContainerNode);
				if (!r.isCollapsed) {
					let df = r.extractContents();
					removeNodesFromChilds( df, nodeName );
					r.insertNode(df);
				}
				

				if ( startContainerNode !== false )
				{		
					removeNodesFromChilds(startContainerNode, _nodeName);
					return;
				}
				if ( endContainerNode !== false )
				{		
					removeNodesFromChilds(endContainerNode, _nodeName);
					return;
				}

				//let r = document.createRange();			
				r.setStartAfter(sp);
				r.setEndBefore(ep);
				if (!r.isCollapsed) {
					const newNode3 = document.createElement(nodeName);
					r.surroundContents(newNode3);
					removeNodesFromChilds(newNode3, nodeName);	
				}								
		
			}
			

			if(range.startContainer === range.endContainer){
				const newNode = document.createElement( nodeName );
				newNode.appendChild( range.extractContents() );
				range.insertNode( newNode );
				removeNodesFromChilds(newNode, nodeName);
				return;
			}
			

			if (!sp) {
				if(ep){
					endCont2Parent(range, ep, nodeName);
					range.setEndBefore(ep);
					if (!range.isCollapsed) 
					{
						const newNode1 = document.createElement(nodeName);
						range.surroundContents(newNode1);
						removeNodesFromChilds(newNode1, nodeName);	
					}	
				}	
				return;
			}

			if (!ep) {		
				if(sp){
					startCont2Parent(range, sp, nodeName);
					range.setStartAfter(sp);
					if (!range.isCollapsed) {
						const newNode1 = document.createElement(nodeName);
						range.surroundContents(newNode1);
						removeNodesFromChilds(newNode1, nodeName);	
					} 	
				}	
				return;
			}		
			
			startCont2Parent(range, sp, nodeName);
			endCont2Parent(range, ep, nodeName);

			let r = document.createRange();			
			r.setStartAfter(sp);
			r.setEndBefore(ep);
			if (!r.isCollapsed) {
				const newNode3 = document.createElement(nodeName);
				r.surroundContents(newNode3);
				removeNodesFromChilds(newNode3, nodeName);	
			}								
		}

		function formatStyle( _nodeName){	
			this.div = document.getElementById( 'DivId' );	
			let nodeName = _nodeName.toUpperCase();			
			var selection = window.getSelection();
			if ( selection.isCollapsed ) return;
			var range = selection.getRangeAt( 0 );	

			if ( nodeName === "A" ){
				if ( value === "" ){
					var newNode = document.createElement( nodeName );
					newNode.href = "I_AM_A_LINK_PLACEHOLDER";
					newNode.target = "_blank";
					newNode.appendChild( range.extractContents() );
					range.insertNode( newNode );

					this.hidePanel();
					this.showLinkPanel();
				}
			}
			
			else				formatWith(range, nodeName);
			selection.empty();
			clean();
			this.div.focus();
		}
		
		
				
		function test00(){
			this.div = DivId;
			style('strong');
			return;
			var selection = window.getSelection();
			var range = selection.getRangeAt( 0 );
			var newNode = document.createElement( "STRONG" );
			newNode.appendChild( range.extractContents() );
			range.insertNode( newNode );
		}		
