type TreeNodeRef = Rc<RefCell<TreeNode>>;

pub struct TreeNode {
   pub val: i32,
   pub left: Option<TreeNodeRef>,
   pub right: Option<TreeNodeRef>,
}

 pub fn dfs(root: TreeNodeRef, target: i32) -> Option<TreeNodeRef> {
    let mut queue = VecDeque::new();
    queue.push_back(root);

    while let Some(node) = queue.pop_front() {
        if node.borrow().val == target {
            return Some(node)
        }

        let items = node.borrow();
        if let Some(left) = &items.left {
            queue.push_front(left.clone());
        }

        if let Some(right) = &items.right {
            queue.push_front(right.clone());
        }
    }

    None
}
